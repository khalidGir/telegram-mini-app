import { useState, useEffect, useCallback } from 'react';
import { ordersApi } from '../api/client';
import type { Order } from '../types';

export function useOrders() {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await ordersApi.list();
      setData(result);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to fetch orders';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
