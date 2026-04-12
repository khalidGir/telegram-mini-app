import { useState } from 'react';
import { Search } from 'lucide-react';
import { useProducts, useCategories } from '../hooks/useProducts';
import { useTelegram } from '../hooks/useTelegram';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import Header from '../components/Header';
import type { ProductFilters } from '../types';

export default function Home() {
  const { user, expand } = useTelegram();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filters: ProductFilters = {
    search: search || undefined,
    category: selectedCategory || undefined,
  };

  const { data: products, loading, error } = useProducts(filters);
  const { data: categories, loading: catsLoading } = useCategories();

  // Expand mini app on mount
  expand();

  const welcomeName = user?.first_name || user?.username || 'there';

  return (
    <div className="page">
      <Header title={`Welcome, ${welcomeName}`} />

      <div className="page__content">
        {/* Search */}
        <div className="search-bar">
          <Search size={18} className="search-bar__icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar__input"
          />
        </div>

        {/* Category Filter */}
        {!catsLoading && categories.length > 0 && (
          <CategoryFilter
            categories={categories.sort((a, b) => a.sort_order - b.sort_order)}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        )}

        {/* Product Grid */}
        {loading && <div className="loading">Loading products...</div>}
        {error && <div className="error">Error: {error}</div>}
        {!loading && products.length === 0 && (
          <div className="empty">No products found</div>
        )}
        {!loading && products.length > 0 && (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
