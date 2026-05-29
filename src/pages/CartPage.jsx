import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { clearCart, decreaseQuantity, increaseQuantity, removeFromCart } from "../store/cartSlice";
import CartItem from "../features/cart/CartItem";

export default function CartPage() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = parseFloat(item.price || item.Price || 0);
      const quantity = item.quantity || 1;
      return sum + (Number.isNaN(price) ? 0 : price * quantity);
    }, 0);
    const shipping = subtotal > 0 ? 4.99 : 0;
    const total = subtotal + shipping;
    const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    return { subtotal, shipping, total, totalItems };
  }, [cartItems]);

  return (
    <div className="catalog-shell">
      <main className="cart-shell">
        <header className="hero">
          <p className="eyebrow">Secure Checkout</p>
          <h1>Your Shopping Cart</h1>
          <p className="subtitle">Review items, update quantities, and proceed when ready.</p>
        </header>

      {cartItems.length === 0 ? (
        <section className="panel empty-cart">
          <p>Your cart is currently empty.</p>
          <Link to="/shop" className="primary-btn">
            Continue Shopping
          </Link>
        </section>
      ) : (
        <section className="cart-layout">
          <div className="panel cart-items-panel">
            <div className="table-head">
              <h2>Cart Items</h2>
              <button type="button" className="link-btn" onClick={() => dispatch(clearCart())}>
                Clear Cart
              </button>
            </div>

            <div className="cart-items-list">
              {cartItems.map((item, index) => (
                <CartItem
                  key={String(item.id || item.SKU || item.ID || item.__rowId || `cart-item-${index}`)}
                  item={item}
                  onIncrease={(sku) => dispatch(increaseQuantity(sku))}
                  onDecrease={(sku) => dispatch(decreaseQuantity(sku))}
                  onRemove={(sku) => dispatch(removeFromCart(sku))}
                />
              ))}
            </div>
          </div>

          <aside className="panel cart-summary">
            <h2>Order Summary</h2>
            <div className="cart-summary-row">
              <span>Items</span>
              <strong>{totals.totalItems}</strong>
            </div>
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <strong>${totals.subtotal.toFixed(2)}</strong>
            </div>
            <div className="cart-summary-row">
              <span>Shipping</span>
              <strong>${totals.shipping.toFixed(2)}</strong>
            </div>
            <div className="cart-summary-row total">
              <span>Total</span>
              <strong>${totals.total.toFixed(2)}</strong>
            </div>

            <Link to="/checkout" className="primary-btn cart-checkout-btn">
              Proceed to Checkout
            </Link>
            <Link to="/shop" className="link-btn cart-continue-link">
              Continue Shopping
            </Link>
          </aside>
        </section>
      )}
      </main>
    </div>
  );
}
