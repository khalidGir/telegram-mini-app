import { getSupabase } from './lib/supabase';
import { verifyTelegramAuth } from './lib/auth';

// GET /api/products
export default async function handler(req: any, res: any) {
  const supabase = getSupabase();

  // ---- GET /api/products ----
  if (req.method === 'GET') {
    try {
      const { category, search, creatorId, id } = req.query;

      // Single product
      if (id) {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            creator:creators(display_name, avatar_url, bio, banner_url),
            categories:product_categories(category:categories(id, name, slug, icon, sort_order))
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        const product = {
          ...data,
          categories: data.categories?.map((pc: { category: Record<string, unknown> }) => pc.category) ?? [],
        };
        return res.status(200).json(product);
      }

      // List products
      let query = supabase
        .from('products')
        .select(`
          *,
          creator:creators(display_name, avatar_url),
          categories:product_categories(category:categories(id, name, slug, icon, sort_order))
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (creatorId) query = query.eq('creator_id', creatorId);

      const { data, error } = await query;
      if (error) throw error;

      let products = (data ?? []).map((p) => ({
        ...p,
        categories: p.categories?.map((pc: { category: Record<string, unknown> }) => pc.category) ?? [],
      }));

      if (category) {
        products = products.filter((p) =>
          p.categories?.some((c: { slug: string }) => c.slug === category)
        );
      }

      if (search) {
        const term = (search as string).toLowerCase();
        products = products.filter(
          (p) =>
            p.title?.toLowerCase().includes(term) ||
            p.description?.toLowerCase().includes(term)
        );
      }

      return res.status(200).json(products);
    } catch (err) {
      console.error('Products GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
  }

  // ---- POST /api/products (create) ----
  if (req.method === 'POST') {
    try {
      const initData = req.headers['x-telegram-init-data'] as string | undefined;
      if (!initData) return res.status(401).json({ error: 'Missing auth' });

      const auth = verifyTelegramAuth(initData);
      if (!auth) return res.status(401).json({ error: 'Invalid auth' });

      const { title, description, price, currency, image_urls, file_url, category_ids } = req.body;
      if (!title || !price) return res.status(400).json({ error: 'title and price required' });

      // Ensure creator exists
      const { data: creator } = await supabase
        .from('creators')
        .select('id')
        .eq('id', auth.userId)
        .single();

      if (!creator) {
        await supabase.from('creators').insert({
          id: auth.userId,
          display_name: auth.telegramUser.username || auth.telegramUser.first_name || 'Creator',
          bio: '',
        });
      }

      const { data: product, error } = await supabase
        .from('products')
        .insert({
          creator_id: auth.userId,
          title: title.trim(),
          description: (description ?? '').trim(),
          price,
          currency: currency ?? 'USD',
          image_urls: image_urls ?? [],
          file_url: file_url ?? null,
        })
        .select()
        .single();

      if (error) throw error;

      if (category_ids?.length > 0) {
        await supabase.from('product_categories').insert(
          category_ids.map((catId: string) => ({ product_id: product.id, category_id: catId }))
        );
      }

      return res.status(201).json(product);
    } catch (err) {
      console.error('Products POST error:', err);
      return res.status(500).json({ error: 'Failed to create product' });
    }
  }

  // ---- PATCH /api/products/:id (update) ----
  if (req.method === 'PATCH') {
    try {
      const initData = req.headers['x-telegram-init-data'] as string | undefined;
      if (!initData) return res.status(401).json({ error: 'Missing auth' });

      const auth = verifyTelegramAuth(initData);
      if (!auth) return res.status(401).json({ error: 'Invalid auth' });

      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id required' });

      const { data: existing } = await supabase
        .from('products')
        .select('creator_id')
        .eq('id', id)
        .single();

      if (!existing || existing.creator_id !== auth.userId) {
        return res.status(403).json({ error: 'Not your product' });
      }

      const clean: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(req.body)) {
        if (v !== undefined) clean[k] = v;
      }

      const { data, error } = await supabase
        .from('products')
        .update(clean)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      console.error('Products PATCH error:', err);
      return res.status(500).json({ error: 'Failed to update product' });
    }
  }

  // ---- DELETE /api/products/:id ----
  if (req.method === 'DELETE') {
    try {
      const initData = req.headers['x-telegram-init-data'] as string | undefined;
      if (!initData) return res.status(401).json({ error: 'Missing auth' });

      const auth = verifyTelegramAuth(initData);
      if (!auth) return res.status(401).json({ error: 'Invalid auth' });

      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id required' });

      const { data: existing } = await supabase
        .from('products')
        .select('creator_id')
        .eq('id', id)
        .single();

      if (!existing || existing.creator_id !== auth.userId) {
        return res.status(403).json({ error: 'Not your product' });
      }

      await supabase.from('product_categories').delete().eq('product_id', id);
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Products DELETE error:', err);
      return res.status(500).json({ error: 'Failed to delete product' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
