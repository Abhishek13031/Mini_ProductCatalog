import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="nav-shell">
      <nav className="panel navbar" aria-label="Main navigation">
        <NavLink to="/" className="brand" end>
          <span className="brand-mark" aria-hidden="true">
            E
          </span>
          <span className="brand-text">shop</span>
        </NavLink>

        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`} end>
            Admin
          </NavLink>
          <NavLink to="/shop" className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}>
            Shop
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}>
            Cart
          </NavLink>
          <NavLink to="/checkout" className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}>
            Checkout
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
