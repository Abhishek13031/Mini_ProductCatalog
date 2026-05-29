import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AdminPage from './pages/AdminPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ProductDetailPage from './pages/ProductDetailPage';
const ShopPage = lazy(() => import('./pages/ShopPage'));

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<AdminPage />} />
        <Route
          path="/shop"
          element={(
            <Suspense fallback={<div className="panel">Loading shop...</div>}>
              <ShopPage />
            </Suspense>
          )}
        />
        <Route path="/shop/:category/:sku" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
    </>
  );
}
