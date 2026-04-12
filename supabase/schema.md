# Supabase Database Schema — Creator Store Mini App

## Tables

### `users`
App users (both buyers and creators). Linked to Supabase Auth.

| Column | Type | Default | Constraints | Description |
|--------|------|---------|-------------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | PK | Supabase Auth user ID |
| `telegram_user_id` | `bigint` | — | UNIQUE, NOT NULL | Telegram user ID |
| `username` | `text` | — | — | Telegram username (without @) |
| `first_name` | `text` | — | — | User's first name |
| `last_name` | `text` | — | — | User's last name |
| `is_creator` | `boolean` | `false` | NOT NULL | Whether user can create products |
| `created_at` | `timestamptz` | `now()` | NOT NULL | Registration timestamp |

---

### `creators`
Extended creator profiles. One-to-one with `users` where `is_creator = true`.

| Column | Type | Default | Constraints | Description |
|--------|------|---------|-------------|-------------|
| `id` | `uuid` | — | PK, FK → users(id) | References users table |
| `display_name` | `text` | — | NOT NULL | Store/display name |
| `bio` | `text` | `''` | NOT NULL | Creator bio/description |
| `avatar_url` | `text` | — | — | Profile image URL |
| `banner_url` | `text` | — | — | Store banner image URL |
| `created_at` | `timestamptz` | `now()` | NOT NULL | Profile creation time |

---

### `categories`
Product categories.

| Column | Type | Default | Constraints | Description |
|--------|------|---------|-------------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | PK | Category ID |
| `name` | `text` | — | NOT NULL, UNIQUE | Display name |
| `slug` | `text` | — | NOT NULL, UNIQUE | URL-friendly identifier |
| `icon` | `text` | — | — | Lucide icon name or emoji |
| `sort_order` | `integer` | `0` | NOT NULL | Display order |

---

### `products`
Digital or physical products for sale.

| Column | Type | Default | Constraints | Description |
|--------|------|---------|-------------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | PK | Product ID |
| `creator_id` | `uuid` | — | FK → creators(id), NOT NULL | Owning creator |
| `title` | `text` | — | NOT NULL | Product name |
| `description` | `text` | `''` | NOT NULL | Product description |
| `price` | `integer` | — | NOT NULL | Price in smallest currency unit (e.g. cents) |
| `currency` | `text` | `'USD'` | NOT NULL | ISO 4217 currency code |
| `image_urls` | `text[]` | `'{}'` | NOT NULL | Array of product image URLs |
| `file_url` | `text` | — | — | Digital file download URL (nullable for physical products) |
| `is_active` | `boolean` | `true` | NOT NULL | Whether product is visible |
| `created_at` | `timestamptz` | `now()` | NOT NULL | Creation timestamp |
| `updated_at` | `timestamptz` | `now()` | NOT NULL | Last update timestamp |

---

### `product_categories`
Many-to-many join table: products ↔ categories.

| Column | Type | Default | Constraints | Description |
|--------|------|---------|-------------|-------------|
| `product_id` | `uuid` | — | PK, FK → products(id) | Product reference |
| `category_id` | `uuid` | — | PK, FK → categories(id) | Category reference |

---

### `orders`
Purchase records.

| Column | Type | Default | Constraints | Description |
|--------|------|---------|-------------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | PK | Order ID |
| `buyer_id` | `uuid` | — | FK → users(id), NOT NULL | Purchasing user |
| `product_id` | `uuid` | — | FK → products(id), NOT NULL | Purchased product |
| `creator_id` | `uuid` | — | FK → creators(id), NOT NULL | Product's creator (denormalized for queries) |
| `amount` | `integer` | — | NOT NULL | Paid amount in smallest currency unit |
| `currency` | `text` | `'USD'` | NOT NULL | ISO 4217 currency code |
| `status` | `text` | `'pending'` | NOT NULL | `pending`, `completed`, `cancelled`, `refunded` |
| `telegram_payment_charge_id` | `text` | — | UNIQUE | Telegram payment charge ID (if paid via Telegram) |
| `created_at` | `timestamptz` | `now()` | NOT NULL | Order creation time |

---

## Indexes

```sql
-- Fast product lookups by creator
CREATE INDEX idx_products_creator_id ON products(creator_id);

-- Active product listing with newest first
CREATE INDEX idx_products_active_created ON products(is_active, created_at DESC);

-- Orders by buyer
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);

-- Orders by creator (for creator dashboard)
CREATE INDEX idx_orders_creator_id ON orders(creator_id);

-- Full-text search on products
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', title || ' ' || description));
```

---

## Row Level Security (RLS) Policies

### `users` table
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Service role can insert (backend creates user records)
CREATE POLICY "Service role can insert users" ON users
  FOR INSERT WITH CHECK (true);
```

### `creators` table
```sql
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;

-- Anyone can view creator profiles (public storefronts)
CREATE POLICY "Creator profiles are publicly viewable" ON creators
  FOR SELECT USING (true);

-- Creators can update their own profile
CREATE POLICY "Creators can update own profile" ON creators
  FOR UPDATE USING (auth.uid() = id);

-- Service role can insert
CREATE POLICY "Service role can insert creators" ON creators
  FOR INSERT WITH CHECK (true);
```

### `categories` table
```sql
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Categories are publicly readable
CREATE POLICY "Categories are publicly viewable" ON categories
  FOR SELECT USING (true);

-- Only service role can modify (admin-managed)
```

### `products` table
```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Active products are publicly viewable
CREATE POLICY "Active products are publicly viewable" ON products
  FOR SELECT USING (is_active = true);

-- Creators can view their own inactive products too
CREATE POLICY "Creators can view own products" ON products
  FOR SELECT USING (auth.uid() = creator_id);

-- Creators can insert their own products
CREATE POLICY "Creators can insert own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Creators can update their own products
CREATE POLICY "Creators can update own products" ON products
  FOR UPDATE USING (auth.uid() = creator_id);

-- Creators can delete their own products
CREATE POLICY "Creators can delete own products" ON products
  FOR DELETE USING (auth.uid() = creator_id);
```

### `orders` table
```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = buyer_id);

-- Creators can view orders for their products
CREATE POLICY "Creators can view orders for their products" ON orders
  FOR SELECT USING (auth.uid() = creator_id);

-- Users can insert their own orders
CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Creators can update order status for their products
CREATE POLICY "Creators can update order status" ON orders
  FOR UPDATE USING (auth.uid() = creator_id);
```

---

## Storage Buckets

### `product-images`
Public bucket for product image uploads.

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Anyone can read
CREATE POLICY "Product images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Authenticated users can upload to their own folder
CREATE POLICY "Users can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update/delete their own images
CREATE POLICY "Users can update own product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### `digital-files`
Private bucket for digital product downloads. Access controlled via backend signed URLs.

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('digital-files', 'digital-files', false);

-- Only service role and creators can upload
CREATE POLICY "Creators can upload digital files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'digital-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Only creators can manage their own files
CREATE POLICY "Creators can update own digital files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'digital-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Creators can delete own digital files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'digital-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## Triggers & Functions

### Auto-update `updated_at` timestamp
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Auto-create `creators` row when user becomes creator
```sql
CREATE OR REPLACE FUNCTION handle_new_creator()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_creator = true THEN
    INSERT INTO public.creators (id, display_name)
    VALUES (NEW.id, COALESCE(NEW.username, 'Creator'))
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_becomes_creator
  AFTER INSERT OR UPDATE OF is_creator ON users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_creator();
```

### Auto-create `users` row on signup (via Supabase Auth trigger)
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, telegram_user_id, username, first_name, last_name)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'telegram_user_id')::bigint,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

---

## Seed Data

### Default categories
```sql
INSERT INTO categories (name, slug, icon, sort_order) VALUES
  ('Templates', 'templates', 'layout-template', 1),
  ('E-Books', 'ebooks', 'book-open', 2),
  ('Courses', 'courses', 'graduation-cap', 3),
  ('Presets', 'presets', 'sliders', 4),
  ('Graphics', 'graphics', 'palette', 5),
  ('Music', 'music', 'music', 6),
  ('Software', 'software', 'code', 7),
  ('Merch', 'merch', 'shopping-bag', 8);
```
