import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Layers, ShieldCheck, ShoppingCart, Tag, Truck } from 'lucide-react';
import { addToCart } from '../store/cartSlice';

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const getProductSku = (product, index) =>
  String(product.id || product.SKU || product.ID || product.__rowId || `row-${index}`)
    .trim()
    .toLowerCase();

const getProductCategory = (product) => slugify(product.category || product.Category || 'general');

export default function ProductDetailPage() {
  const { category, sku } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.products);

  const routeSku = decodeURIComponent(String(sku || '')).trim().toLowerCase();
  const routeCategory = slugify(category || 'general');

  const product =
    products.find((item, index) => getProductSku(item, index) === routeSku && getProductCategory(item) === routeCategory) ||
    products.find((item, index) => getProductSku(item, index) === routeSku);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const currentSku = getProductSku(product, 0);
    const currentCategory = getProductCategory(product);

    return products
      .filter((item, index) => {
        const skuValue = getProductSku(item, index);
        return skuValue !== currentSku && getProductCategory(item) === currentCategory;
      })
      .slice(0, 3);
  }, [products, product]);

  if (!product) {
    return (
      <div className="catalog-shell">
        <div className="product-detail-shell product-not-found">
          <h2 className="text-3xl font-bold">Product Not Found</h2>
          <p className="mt-2">The product you are looking for does not exist.</p>
          <button onClick={() => navigate('/shop')} className="primary-btn mt-5 inline-flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const title = product.name || product.Title || product.title || 'Unnamed Product';
  const price = parseFloat(product.price || product.Price || 0);
  const productSku = String(product.id || product.SKU || product.ID || sku);
  const productCategoryLabel = String(product.category || product.Category || category);
  const image = product.image || product.Image || null;
  const imageSeed = String(productSku || title).replace(/\s+/g, '-').toLowerCase();
  const fallbackImage = `https://picsum.photos/seed/${encodeURIComponent(imageSeed)}/900/700`;
  const displayImage = image || fallbackImage;

  const handleAddToCart = () => {
    dispatch(addToCart(product));
    navigate('/cart');
  };

  return (
    <div className="catalog-shell">
      <div className="product-detail-shell product-detail-wrap">
        <button onClick={() => navigate('/shop')} className="link-btn back-btn inline-flex items-center gap-2">
          <ArrowLeft size={16} className="shrink-0" />
          Back to Shop
        </button>

        <div className="product-detail-card mt-4">
          <div className="product-detail-media">
            <img src={displayImage} alt={title} className="product-detail-image" loading="lazy" />
          </div>

          <div className="product-detail-info">
            <h1 className="product-detail-title">{title}</h1>
            <p className="product-detail-price">${price.toFixed(2)}</p>
            <p className="product-detail-sku">SKU: {productSku}</p>

            <div className="product-detail-features mt-5">
              <div className="feature-item">
                <Tag size={16} />
                <span>Category: {productCategoryLabel}</span>
              </div>
              <div className="feature-item">
                <ShieldCheck size={16} />
                <span>Quality Assured</span>
              </div>
              <div className="feature-item">
                <Truck size={16} />
                <span>Fast Shipping</span>
              </div>
              <div className="feature-item">
                <Layers size={16} />
                <span>Multiple Variants</span>
              </div>
            </div>

            <button onClick={handleAddToCart} className="primary-btn add-to-cart-btn mt-6 inline-flex items-center justify-center gap-2">
              <ShoppingCart size={16} />
              Add to Cart
            </button>
          </div>
        </div>

        {relatedProducts.length > 0 ? (
          <section className="panel mt-4">
            <h2>Related Products</h2>
            <div className="shop-grid">
              {relatedProducts.map((item, index) => {
                const itemSku = String(item.id || item.SKU || item.ID || `related-${index}`);
                const itemTitle = item.name || item.Title || item.title || 'Related Product';
                const itemPrice = parseFloat(item.price || item.Price || 0);
                const itemImageSeed = String(itemSku || itemTitle).replace(/\s+/g, '-').toLowerCase();
                const itemImage = item.image || item.Image || `https://picsum.photos/seed/${encodeURIComponent(itemImageSeed)}/640/420`;

                return (
                  <article
                    key={itemSku}
                    className="shop-card"
                    onClick={() => navigate(`/shop/${getProductCategory(item)}/${encodeURIComponent(itemSku)}`)}
                  >
                    <div className="shop-card-media">
                      <div className="shop-image-wrap">
                        <img src={itemImage} alt={itemTitle} className="shop-image" loading="lazy" />
                        <span className="shop-sku-badge">SKU: {itemSku}</span>
                      </div>
                    </div>
                    <div className="shop-card-body">
                      <h3 className="shop-title">{itemTitle}</h3>
                      <p className="shop-price-label">Price</p>
                      <p className="shop-price">${itemPrice.toFixed(2)}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
