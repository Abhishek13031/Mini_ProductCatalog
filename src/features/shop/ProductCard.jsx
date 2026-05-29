import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../../store/cartSlice';
import { ShoppingCart } from 'lucide-react';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle dynamic keys safely depending on your CSV header mappings
  const title = product.name || product.Title || product.title || 'Unnamed Product';
  const price = parseFloat(product.price || product.Price || 0);
  const sku = product.id || product.SKU || product.ID;
  const category = product.category || product.Category;
  const image = product.image || product.Image || null;
  const imageSeed = String(sku || title).replace(/\s+/g, '-').toLowerCase();
  const fallbackImage = `https://picsum.photos/seed/${encodeURIComponent(imageSeed)}/640/420`;
  const displayImage = image || fallbackImage;

  const slugify = (value) =>
    String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const handleAddToCart = (e) => {
    e.stopPropagation();
    dispatch(addToCart(product));
  };

  const handleCardClick = () => {
    const categorySlug = slugify(category || 'general');
    const skuSlug = encodeURIComponent(String(sku || title));
    navigate(`/shop/${categorySlug}/${skuSlug}`);
  };

  return (
    <article className="shop-card" onClick={handleCardClick}>
      <div className="shop-card-media">
        <div className="shop-image-wrap">
          <img
            src={displayImage}
            alt={title}
            className="shop-image"
            loading="lazy"
          />
          <span className="shop-sku-badge">
            {sku ? `SKU: ${sku}` : 'No SKU'}
          </span>
        </div>
      </div>

      <div className="shop-card-body">
        <h3 className="shop-title">{title}</h3>
        <p className="shop-price-label">Price</p>
        <p className="shop-price">${price.toFixed(2)}</p>
      </div>

      <div className="shop-card-footer">
        <button onClick={handleAddToCart} className="primary-btn shop-add-btn">
          <ShoppingCart size={16} />
          <span>Add to Cart</span>
        </button>
      </div>
    </article>
  );
}
