import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useProduct } from '../hooks/useProducts';
import { useTelegram } from '../hooks/useTelegram';
import { ordersApi } from '../api/client';
import Header from '../components/Header';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hideMainButton } = useTelegram();
  const { data: product, loading, error } = useProduct(id);

  useEffect(() => {
    hideMainButton();
    return () => { hideMainButton(); };
  }, [hideMainButton]);

  const handleBuy = async () => {
    if (!product) return;
    try {
      const order = await ordersApi.create(product.id);
      alert('Order created! Status: ' + order.status);
      navigate('/orders');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to create order';
      alert(message);
    }
  };

  if (loading) return <div className="page"><div className="loading">Loading product...</div></div>;
  if (error) return <div className="page"><div className="error">Error: {error}</div></div>;
  if (!product) return <div className="page"><div className="empty">Product not found</div></div>;

  const price = formatPrice(product.price, product.currency);

  return (
    <div className="page">
      <Header title="Product" showBack />

      <div className="page__content product-detail">
        {/* Image Gallery */}
        <div className="product-detail__gallery">
          {product.image_urls.length > 0 ? (
            <img src={product.image_urls[0]} alt={product.title} className="product-detail__main-image" />
          ) : (
            <div className="product-detail__placeholder">
              <ShoppingBag size={64} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="product-detail__info">
          <h1 className="product-detail__title">{product.title}</h1>
          <span className="product-detail__price">{price}</span>
          <p className="product-detail__desc">{product.description}</p>

          {product.categories && product.categories.length > 0 && (
            <div className="product-detail__categories">
              {product.categories.map((cat) => (
                <span key={cat.id} className="tag">{cat.name}</span>
              ))}
            </div>
          )}
        </div>

        {/* Buy button area */}
        <div className="product-detail__actions">
          <button className="btn-primary" onClick={handleBuy}>
            Buy Now — {price}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount / 100);
}
