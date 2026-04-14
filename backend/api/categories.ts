import { getSupabase } from './lib/supabase';

// GET /api/categories
export default async function handler(req: any, res: any) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    res.status(200).json(data ?? []);
  } catch (err) {
    console.error('Categories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}
