import { useState, useEffect, useCallback } from 'react';
import { productsApi, categoriesApi, creatorsApi } from '../api/client';
import type { Product, Category, ProductFilters, Creator } from '../types';

// ---- Products ----
export function useProducts(filters?: ProductFilters) {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await productsApi.list(filters);
      setData(result);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to fetch products';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters?.category, filters?.search, filters?.creatorId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useProduct(id?: string) {
  const [data, setData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await productsApi.getById(id);
        if (!cancelled) setData(result);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to fetch product';
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [id]);

  return { data, loading, error };
}

// ---- Categories ----
export function useCategories() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await categoriesApi.list();
        if (!cancelled) setData(result);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to fetch categories';
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}

// ---- Creators ----
export function useCreator(id?: string) {
  const [data, setData] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await creatorsApi.getById(id);
        if (!cancelled) setData(result);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to fetch creator';
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [id]);

  return { data, loading, error };
}

export function useCreatorProducts(creatorId?: string) {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!creatorId) return;
    let cancelled = false;

    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await creatorsApi.getProducts(creatorId);
        if (!cancelled) setData(result);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to fetch creator products';
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [creatorId]);

  return { data, loading, error };
}
