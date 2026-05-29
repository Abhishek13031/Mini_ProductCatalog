import { Minus, Plus, Trash2 } from 'lucide-react';

const formatPrice = (value) => {
  const parsed = parseFloat(value || 0);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export default function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  const title = item.name || item.Title || item.title || 'Unnamed Product';
  const sku = String(item.id || item.SKU || item.ID || item.__rowId || title);
  const quantity = item.quantity || 1;
  const unitPrice = formatPrice(item.price || item.Price);
  const lineTotal = unitPrice * quantity;
  const imageSeed = String(sku || title).replace(/\s+/g, '-').toLowerCase();
  const fallbackImage = `https://picsum.photos/seed/${encodeURIComponent(imageSeed)}/320/220`;
  const image = item.image || item.Image || fallbackImage;

  return (
    <article className="cart-item-card">
      <img src={image} alt={title} className="cart-item-image" loading="lazy" />

      <div className="cart-item-body">
        <p className="cart-item-sku">SKU: {sku}</p>
        <h3 className="cart-item-title">{title}</h3>
        <p className="cart-item-unit">${unitPrice.toFixed(2)} each</p>

        <div className="cart-item-actions">
          <div className="cart-qty-control">
            <button type="button" className="cart-icon-btn" onClick={() => onDecrease(sku)} disabled={quantity <= 1}>
              <Minus size={14} />
            </button>
            <span>{quantity}</span>
            <button type="button" className="cart-icon-btn" onClick={() => onIncrease(sku)}>
              <Plus size={14} />
            </button>
          </div>

          <button type="button" className="cart-remove-btn" onClick={() => onRemove(sku)}>
            <Trash2 size={14} />
            Remove
          </button>
        </div>
      </div>

      <div className="cart-item-total">
        <p>Line Total</p>
        <strong>${lineTotal.toFixed(2)}</strong>
      </div>
    </article>
  );
}
