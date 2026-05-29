import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { CheckCircle, CreditCard, ShoppingBag, Truck } from 'lucide-react';
import { clearCart } from '../store/cartSlice';

export default function CheckoutPage() {
  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const summary = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = parseFloat(item.price || item.Price || 0);
      const quantity = item.quantity || 1;
      return sum + (Number.isNaN(price) ? 0 : price * quantity);
    }, 0);
    const shipping = subtotal > 0 ? 4.99 : 0;
    const total = subtotal + shipping;
    return { subtotal, shipping, total };
  }, [cartItems]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      dispatch(clearCart());
    }, 1800);
  };

  if (isSuccess) {
    return (
      <div className="catalog-shell">
        <main className="checkout-shell">
          <section className="panel checkout-success">
            <CheckCircle size={58} className="checkout-success-icon" />
            <h1>Order Confirmed</h1>
            <p>Thank you. Your payment was authorized and your order is now being prepared for dispatch.</p>
            <Link to="/shop" className="primary-btn checkout-success-btn">
              Continue Shopping
            </Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="catalog-shell">
      <main className="checkout-shell">
        <header className="hero">
          <p className="eyebrow">Secure Checkout</p>
          <h1>Checkout</h1>
          <p className="subtitle">Review your order and complete your purchase.</p>
        </header>

        {cartItems.length === 0 ? (
          <section className="panel checkout-empty">
            <ShoppingBag size={48} className="checkout-empty-icon" />
            <h2>Your cart is empty</h2>
            <p>Add products before moving to checkout.</p>
            <Link to="/shop" className="primary-btn">
              Back to Store
            </Link>
          </section>
        ) : (
          <form onSubmit={handleFormSubmit} className="checkout-layout">
            <div className="checkout-form-column">
              <section className="panel checkout-panel-block">
                <h2 className="checkout-section-title">
                  <Truck size={18} />
                  Shipping Details
                </h2>
                <div className="checkout-input-grid">
                  <input required type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleInputChange} />
                  <input required type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} />
                  <input required type="text" name="address" placeholder="Street Address" value={formData.address} onChange={handleInputChange} />
                  <div className="checkout-inline-inputs">
                    <input required type="text" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} />
                    <input required type="text" name="zipCode" placeholder="ZIP Code" value={formData.zipCode} onChange={handleInputChange} />
                  </div>
                </div>
              </section>

              <section className="panel checkout-panel-block">
                <h2 className="checkout-section-title">
                  <CreditCard size={18} />
                  Payment Information
                </h2>
                <div className="checkout-input-grid">
                  <input required type="text" name="cardNumber" placeholder="Card Number (16 digits)" value={formData.cardNumber} onChange={handleInputChange} maxLength="16" />
                  <div className="checkout-inline-inputs">
                    <input required type="text" name="expiry" placeholder="MM/YY" value={formData.expiry} onChange={handleInputChange} maxLength="5" />
                    <input required type="text" name="cvv" placeholder="CVV" value={formData.cvv} onChange={handleInputChange} maxLength="3" />
                  </div>
                </div>
              </section>
            </div>

            <aside className="panel checkout-summary">
              <h2>Order Summary</h2>
              <ul className="checkout-items-list">
                {cartItems.map((item, index) => {
                  const price = parseFloat(item.price || item.Price || 0);
                  const qty = item.quantity || 1;
                  const lineTotal = (Number.isNaN(price) ? 0 : price) * qty;
                  return (
                    <li key={String(item.id || item.SKU || item.ID || item.__rowId || index)} className="checkout-item-row">
                      <div>
                        <span className="checkout-item-name">{item.name || item.Title || item.title || 'Product'}</span>
                        <span className="checkout-item-qty">Qty: {qty}</span>
                      </div>
                      <strong>${lineTotal.toFixed(2)}</strong>
                    </li>
                  );
                })}
              </ul>

              <div className="checkout-totals">
                <div>
                  <span>Subtotal</span>
                  <strong>${summary.subtotal.toFixed(2)}</strong>
                </div>
                <div>
                  <span>Shipping</span>
                  <strong>${summary.shipping.toFixed(2)}</strong>
                </div>
                <div className="checkout-total-final">
                  <span>Total</span>
                  <strong>${summary.total.toFixed(2)}</strong>
                </div>
              </div>

              <button type="submit" disabled={isProcessing} className="primary-btn checkout-pay-btn">
                {isProcessing ? 'Processing Secure Payment...' : `Authorize Payment ($${summary.total.toFixed(2)})`}
              </button>
            </aside>
          </form>
        )}
      </main>
    </div>
  );
}
