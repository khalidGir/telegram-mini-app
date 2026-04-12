import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { useTelegram } from '../hooks/useTelegram';
import { productsApi } from '../api/client';
import Header from '../components/Header';

export default function CreateProduct() {
  const navigate = useNavigate();
  useTelegram();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setImageUrls((prev) => [...prev, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) return;

    setSubmitting(true);
    setError(null);

    try {
      await productsApi.create({
        title: title.trim(),
        description: description.trim(),
        price: Math.round(parseFloat(price) * 100),
        currency: 'USD',
        image_urls: imageUrls,
        file_url: fileUrl || undefined,
      });
      navigate('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create product';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <Header title="Create Product" showBack />

      <div className="page__content">
        <form onSubmit={handleSubmit} className="form">
          {error && <div className="error">{error}</div>}

          <label className="form__field">
            <span className="form__label">Title *</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Product name"
              required
              className="form__input"
            />
          </label>

          <label className="form__field">
            <span className="form__label">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product..."
              rows={4}
              className="form__input form__textarea"
            />
          </label>

          <label className="form__field">
            <span className="form__label">Price (USD) *</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="9.99"
              min="0"
              step="0.01"
              required
              className="form__input"
            />
          </label>

          <label className="form__field">
            <span className="form__label">Images</span>
            <div className="form__image-input">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="form__input"
              />
              <button type="button" onClick={handleAddImage} className="form__add-btn">
                <Plus size={18} />
              </button>
            </div>
          </label>

          {imageUrls.length > 0 && (
            <div className="image-list">
              {imageUrls.map((url, i) => (
                <div key={i} className="image-list__item">
                  <img src={url} alt="" className="image-list__thumb" />
                  <button type="button" onClick={() => handleRemoveImage(i)} className="image-list__remove">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="form__field">
            <span className="form__label">Digital File URL</span>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://example.com/file.zip (optional)"
              className="form__input"
            />
          </label>

          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Creating...' : 'Create Product'}
          </button>
        </form>
      </div>
    </div>
  );
}
