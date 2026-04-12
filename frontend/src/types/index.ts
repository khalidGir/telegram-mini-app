export interface User {
  id: string;
  telegram_user_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  is_creator: boolean;
  created_at: string;
}

export interface Creator {
  id: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  banner_url: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
}

export interface Product {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image_urls: string[];
  file_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  creator?: Creator;
  categories?: Category[];
}

export interface ProductCategory {
  product_id: string;
  category_id: string;
}

export type OrderStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  buyer_id: string;
  product_id: string;
  creator_id: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  telegram_payment_charge_id: string | null;
  created_at: string;
  product?: Product;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramWebAppInitData {
  query_id: string;
  user: TelegramUser;
  auth_date: string;
  hash: string;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  creatorId?: string;
}

export interface CreateProductInput {
  title: string;
  description: string;
  price: number;
  currency: string;
  image_urls: string[];
  file_url?: string;
  category_ids?: string[];
}

export type RoutePath =
  | '/'
  | '/product/:id'
  | '/creator/:id'
  | '/orders'
  | '/create-product';
