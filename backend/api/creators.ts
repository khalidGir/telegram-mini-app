import { getSupabase } from './lib/supabase';

// GET /api/creators
export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabase();
    const { id, products } = req.query;

    // Creator's products
    if (id && products) {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories:product_categories(category:categories(id, name, slug, icon, sort_order))
        `)
        .eq('creator_id', id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const productList = (data ?? []).map((p) => ({
        ...p,
        categories: p.categories?.map((pc: { category: Record<string, unknown> }) => pc.category) ?? [],
      }));

      return res.status(200).json(productList);
    }

    // Single creator
    if (id) {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    // List all creators
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data ?? []);
  } catch (err) {
    console.error('Creators error:', err);
    res.status(500).json({ error: 'Failed to fetch creators' });
  }
}
