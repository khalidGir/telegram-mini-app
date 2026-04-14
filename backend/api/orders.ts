import { getSupabase } from './lib/supabase';
import { verifyTelegramAuth } from './lib/auth';

// GET/POST/PATCH /api/orders
export default async function handler(req: any, res: any) {
  const supabase = getSupabase();

  // ---- GET /api/orders (my orders) ----
  if (req.method === 'GET') {
    try {
      const initData = req.headers['x-telegram-init-data'] as string | undefined;
      if (!initData) return res.status(401).json({ error: 'Missing auth' });

      const auth = verifyTelegramAuth(initData);
      if (!auth) return res.status(401).json({ error: 'Invalid auth' });

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          product:products(id, title, image_urls)
        `)
        .eq('buyer_id', auth.userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data ?? []);
    } catch (err) {
      console.error('Orders GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }

  // ---- POST /api/orders (create) ----
  if (req.method === 'POST') {
    try {
      const initData = req.headers['x-telegram-init-data'] as string | undefined;
      if (!initData) return res.status(401).json({ error: 'Missing auth' });

      const auth = verifyTelegramAuth(initData);
      if (!auth) return res.status(401).json({ error: 'Invalid auth' });

      const { product_id } = req.body;
      if (!product_id) return res.status(400).json({ error: 'product_id required' });

      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, price, currency, creator_id, is_active')
        .eq('id', product_id)
        .single();

      if (productError || !product) return res.status(404).json({ error: 'Product not found' });
      if (!product.is_active) return res.status(400).json({ error: 'Product not available' });

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          buyer_id: auth.userId,
          product_id: product.id,
          creator_id: product.creator_id,
          amount: product.price,
          currency: product.currency,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(order);
    } catch (err) {
      console.error('Orders POST error:', err);
      return res.status(500).json({ error: 'Failed to create order' });
    }
  }

  // ---- PATCH /api/orders/:id (update status) ----
  if (req.method === 'PATCH') {
    try {
      const initData = req.headers['x-telegram-init-data'] as string | undefined;
      if (!initData) return res.status(401).json({ error: 'Missing auth' });

      const auth = verifyTelegramAuth(initData);
      if (!auth) return res.status(401).json({ error: 'Invalid auth' });

      const { id } = req.query;
      const { status } = req.body;

      if (!['pending', 'completed', 'cancelled', 'refunded'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const { data: existing } = await supabase
        .from('orders')
        .select('buyer_id, creator_id')
        .eq('id', id)
        .single();

      if (!existing) return res.status(404).json({ error: 'Order not found' });
      if (existing.buyer_id !== auth.userId && existing.creator_id !== auth.userId) {
        return res.status(403).json({ error: 'Not your order' });
      }

      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      console.error('Orders PATCH error:', err);
      return res.status(500).json({ error: 'Failed to update order' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
