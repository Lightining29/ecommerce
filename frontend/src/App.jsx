import { Routes, Route, Navigate } from 'react-router-dom';
import { HomeLayout } from './pages/shop/Home';
import Cart from './pages/shop/Cart';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Checkout from './pages/shop/Checkout';
import CheckoutSuccess from './pages/shop/CheckoutSuccess';
import AccountLayout from './pages/account/AccountLayout';
import OrderHistory from './pages/account/OrderHistory';
import WishlistPage from './pages/account/WishlistPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminBanner from './pages/admin/AdminBanner';
import AdminCategories from './pages/admin/AdminCategories';
import AdminContacts from './pages/admin/AdminContacts';
import Contact from './pages/Contact';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import './pages/shop/Home.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeLayout />} />
      <Route
        path="/cart"
        element={
          <>
            <Navbar />
            <Cart />
            <Footer />
          </>
        }
      />
      <Route
        path="/contact"
        element={
          <>
            <Navbar />
            <Contact />
            <Footer />
          </>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout/success"
        element={
          <ProtectedRoute>
            <CheckoutSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <AccountLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OrderHistory />} />
        <Route path="wishlist" element={<WishlistPage />} />
      </Route>
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/:id/edit" element={<AdminProductForm />} />
        <Route path="banner" element={<AdminBanner />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="categories/new" element={<AdminCategories />} />
        <Route path="categories/:id/edit" element={<AdminCategories />} />
        <Route path="contacts" element={<AdminContacts />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
