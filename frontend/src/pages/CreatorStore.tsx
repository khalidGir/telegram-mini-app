import { useParams } from 'react-router-dom';
import { useCreator, useCreatorProducts } from '../hooks/useProducts';
import { useTelegram } from '../hooks/useTelegram';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';

export default function CreatorStore() {
  const { id } = useParams<{ id: string }>();
  const { expand } = useTelegram();

  const { data: creator, loading: creatorLoading, error: creatorError } = useCreator(id);
  const { data: products, loading: productsLoading, error: productsError } = useCreatorProducts(id);

  expand();

  return (
    <div className="page">
      <Header title={creator?.display_name ?? 'Store'} showBack />

      {/* Banner */}
      {creator?.banner_url && (
        <div className="creator-banner">
          <img src={creator.banner_url} alt={creator.display_name} />
        </div>
      )}

      {/* Creator Info */}
      <div className="page__content">
        {creatorLoading && <div className="loading">Loading store...</div>}
        {creatorError && <div className="error">Error: {creatorError}</div>}
        {creator && (
          <div className="creator-info">
            {creator.avatar_url && (
              <img src={creator.avatar_url} alt={creator.display_name} className="creator-info__avatar" />
            )}
            <h2 className="creator-info__name">{creator.display_name}</h2>
            {creator.bio && <p className="creator-info__bio">{creator.bio}</p>}
          </div>
        )}

        {/* Products */}
        {productsLoading && <div className="loading">Loading products...</div>}
        {productsError && <div className="error">Error: {productsError}</div>}
        {!productsLoading && products.length === 0 && (
          <div className="empty">This store has no products yet</div>
        )}
        {!productsLoading && products.length > 0 && (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
