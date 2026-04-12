import { useOrders } from '../hooks/useOrders';
import { useTelegram } from '../hooks/useTelegram';
import Header from '../components/Header';

export default function Orders() {
  const { expand } = useTelegram();
  const { data: orders, loading, error } = useOrders();

  expand();

  return (
    <div className="page">
      <Header title="My Orders" showBack />

      <div className="page__content">
        {loading && <div className="loading">Loading orders...</div>}
        {error && <div className="error">Error: {error}</div>}
        {!loading && orders.length === 0 && (
          <div className="empty">No orders yet</div>
        )}
        {!loading && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-card__info">
                  <h3 className="order-card__product">
                    {order.product?.title ?? `Product #${order.product_id.slice(0, 8)}`}
                  </h3>
                  <span className="order-card__date">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="order-card__right">
                  <span className="order-card__amount">
                    {formatPrice(order.amount, order.currency)}
                  </span>
                  <span className={`order-card__status status-${order.status}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
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
