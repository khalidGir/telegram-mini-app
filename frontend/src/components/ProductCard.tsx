import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const price = formatPrice(product.price, product.currency);
  const imageUrl = product.image_urls[0] ?? null;

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-card__image">
        {imageUrl ? (
          <img src={imageUrl} alt={product.title} loading="lazy" />
        ) : (
          <div className="product-card__placeholder">
            <ShoppingBag size={32} />
          </div>
        )}
        <span className="product-card__price">{price}</span>
      </div>
      <div className="product-card__info">
        <h3 className="product-card__title">{product.title}</h3>
        <p className="product-card__desc">{truncate(product.description, 60)}</p>
        {product.categories && product.categories.length > 0 && (
          <div className="product-card__tags">
            {product.categories.slice(0, 2).map((cat) => (
              <span key={cat.id} className="tag">{cat.name}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount / 100);
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}
