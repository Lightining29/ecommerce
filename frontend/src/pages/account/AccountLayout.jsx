import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Package, Heart, ShoppingBag, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import '../../styles/Panel.css';

export default function AccountLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <Navbar />
      <div className="panel-layout">
        <aside className="panel-sidebar">
          <div className="panel-sidebar-header">
            <h2>My Account</h2>
            <p>{user?.name}</p>
          </div>
          <nav className="panel-nav">
            <NavLink to="/account" end>
              <Package size={18} /> Order History
            </NavLink>
            <NavLink to="/account/wishlist">
              <Heart size={18} /> Wishlist
            </NavLink>
            <NavLink to="/cart">
              <ShoppingBag size={18} /> Cart
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin">
                <Shield size={18} /> Admin Panel
              </NavLink>
            )}
            <button onClick={handleLogout}>
              <LogOut size={18} /> Sign Out
            </button>
          </nav>
        </aside>
        <main className="panel-content">
          <Outlet />
        </main>
      </div>
    </>
  );
}
