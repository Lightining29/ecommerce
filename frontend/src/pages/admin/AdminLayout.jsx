import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, PlusCircle, LogOut, Home, Image, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Panel.css';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="panel-layout" style={{ minHeight: '100vh' }}>
      <aside className="panel-sidebar dark" style={{ background: 'linear-gradient(180deg, #1A2B3C 0%, #2A3F54 100%)', border: 'none' }}>
        <div className="panel-sidebar-header" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <h2 style={{ color: 'var(--sky-blue)' }}>Glowora Admin</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>{user?.name}</p>
        </div>
        <nav className="panel-nav">
          <NavLink to="/admin" end style={{ color: 'rgba(255,255,255,0.7)' }}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/admin/orders" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <Package size={18} /> Orders
          </NavLink>
          <NavLink to="/admin/products" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <ShoppingCart size={18} /> Products
          </NavLink>
          <NavLink to="/admin/categories" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <Package size={18} /> Categories
          </NavLink>
          <NavLink to="/admin/contacts" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <Mail size={18} /> Messages
          </NavLink>
          <NavLink to="/admin/products/new" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <PlusCircle size={18} /> Add Product
          </NavLink>
          <NavLink to="/admin/banner" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <Image size={18} /> Banner Editor
          </NavLink>
          <NavLink to="/" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <Home size={18} /> Storefront
          </NavLink>
          <button onClick={() => { logout(); navigate('/'); }} style={{ color: 'rgba(255,255,255,0.7)' }}>
            <LogOut size={18} /> Sign Out
          </button>
        </nav>
      </aside>
      <main className="panel-content">
        <Outlet />
      </main>
    </div>
  );
}
