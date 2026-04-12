import axios from 'axios';
import type {
  Product,
  Creator,
  Category,
  Order,
  ProductFilters,
  CreateProductInput,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export function setAuthHeader(initData: string) {
  api.defaults.headers.common['X-Telegram-Init-Data'] = initData;
}

export const productsApi = {
  list: (filters?: ProductFilters) =>
    api.get<Product[]>('/api/products', { params: filters }).then((r) => r.data),

  getById: (id: string) =>
    api.get<Product>('/api/products', { params: { id } }).then((r) => r.data),

  create: (input: CreateProductInput) =>
    api.post<Product>('/api/products', input).then((r) => r.data),

  update: (id: string, input: Partial<CreateProductInput>) =>
    api.patch<Product>(`/api/products?id=${id}`, input).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/api/products?id=${id}`),
};

export const creatorsApi = {
  list: () =>
    api.get<Creator[]>('/api/creators').then((r) => r.data),

  getById: (id: string) =>
    api.get<Creator>('/api/creators', { params: { id } }).then((r) => r.data),

  getProducts: (id: string) =>
    api.get<Product[]>('/api/creators', { params: { id, products: '1' } }).then((r) => r.data),
};

export const categoriesApi = {
  list: () =>
    api.get<Category[]>('/api/categories').then((r) => r.data),
};

export const ordersApi = {
  list: () =>
    api.get<Order[]>('/api/orders').then((r) => r.data),

  create: (productId: string) =>
    api.post<Order>('/api/orders', { product_id: productId }).then((r) => r.data),

  updateStatus: (id: string, status: Order['status']) =>
    api.patch<Order>(`/api/orders?id=${id}`, { status }).then((r) => r.data),
};

export default api;
