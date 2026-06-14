import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu, X, Droplets } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Shop', href: '#bestsellers' },
  { label: 'Categories', href: '#categories' },
  { label: 'About Us', href: '#about' },
  { label: 'Blog', href: '#blog' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const { cartCount } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  function handleNavClick(e, link) {
    // close mobile menu
    setMenuOpen(false);

    if (link.href && link.href.startsWith('#')) {
      e.preventDefault();
      const id = link.href.slice(1);

      if (location.pathname === '/') {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }

      // navigate to home and then scroll to section
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else window.location.hash = link.href;
      }, 150);
    }
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">
          <Droplets size={22} className="logo-icon" />
          <span>Glowora</span>
        </Link>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} onClick={(e) => handleNavClick(e, link)}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <button className="icon-btn" aria-label="Search">
            <Search size={20} />
          </button>
          <div className="user-menu-wrap">
            <button className="icon-btn" aria-label="Account" onClick={() => setUserMenuOpen(!userMenuOpen)}>
              <User size={20} />
            </button>
            {userMenuOpen && (
              <div className="user-dropdown">
                {user ? (
                  <>
                    <p className="user-dropdown-name">{user.name}</p>
                    <Link to="/account" onClick={() => setUserMenuOpen(false)}>My Account</Link>
                    <Link to="/account/wishlist" onClick={() => setUserMenuOpen(false)}>Wishlist</Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)}>Admin Panel</Link>
                    )}
                    <button onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }}>
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setUserMenuOpen(false)}>Sign In</Link>
                    <Link to="/register" onClick={() => setUserMenuOpen(false)}>Register</Link>
                  </>
                )}
              </div>
            )}
          </div>
          <Link to="/cart" className="icon-btn cart-btn" aria-label="Cart">
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          <button
            className="icon-btn menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
