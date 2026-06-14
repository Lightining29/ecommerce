import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { checkout, demoPay, formatPrice, getProductPrice } from '../../api';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import './Checkout.css';
import '../auth/Auth.css';

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="success-page">
          <div className="success-card">
            <h1>Cart is empty</h1>
            <Link to="/" className="btn btn-sky">Continue Shopping</Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = items.map((i) => ({
        productId: i._id,
        quantity: i.quantity,
      }));
      const result = await checkout(payload, form);

      if (result.sessionUrl) {
        window.location.href = result.sessionUrl;
        return;
      }

      if (result.demo) {
        await demoPay(result.orderId);
        clearCart();
        navigate(`/checkout/success?orderId=${result.orderId}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="checkout-page">
        <div className="container">
          <Link to="/cart" className="back-link">
            <ArrowLeft size={18} /> Back to Cart
          </Link>
          <h1 className="checkout-title">Checkout</h1>

          <div className="checkout-layout">
            <form className="checkout-form-card" onSubmit={handleSubmit}>
              <h3>Shipping Information</h3>
              {error && <div className="auth-error">{error}</div>}
              <div className="demo-pay-notice">
                <CreditCard size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Demo mode: payment will be simulated and a receipt email will be sent (or logged to server console).
              </div>
              <div className="checkout-grid">
                <div className="form-group full">
                  <label>Full Name</label>
                  <input value={form.fullName} onChange={update('fullName')} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={update('email')} required />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input value={form.phone} onChange={update('phone')} />
                </div>
                <div className="form-group full">
                  <label>Address</label>
                  <input value={form.address} onChange={update('address')} required />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input value={form.city} onChange={update('city')} required />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input value={form.state} onChange={update('state')} />
                </div>
                <div className="form-group">
                  <label>ZIP Code</label>
                  <input value={form.zip} onChange={update('zip')} required />
                </div>
              </div>
              <button type="submit" className="btn btn-sky" style={{ width: '100%', marginTop: 24, justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Processing...' : `Pay ${formatPrice(cartTotal)}`}
              </button>
            </form>

            <div className="checkout-summary">
              <h3>Order Summary</h3>
              {items.map((item) => (
                <div key={item._id} className="checkout-item">
                  <img src={item.image} alt={item.name} />
                  <div className="checkout-item-info">
                    <h4>{item.name}</h4>
                    <span>Qty: {item.quantity}</span>
                  </div>
                  <span>{formatPrice(getProductPrice(item) * item.quantity)}</span>
                </div>
              ))}
              <div className="summary-divider" style={{ margin: '16px 0', borderTop: '2px solid var(--border)' }} />
              <div className="summary-row total" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
                <span>Total</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
