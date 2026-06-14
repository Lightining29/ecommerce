import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Mail } from 'lucide-react';
import { fetchOrder, formatPrice } from '../../api';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import './Checkout.css';

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (orderId) fetchOrder(orderId).then(setOrder).catch(() => {});
  }, [orderId]);

  return (
    <>
      <Navbar />
      <div className="success-page">
        <div className="success-card">
          <div className="success-icon">
            <CheckCircle size={36} />
          </div>
          <h1>Payment Successful!</h1>
          <p>Thank you for your order.</p>
          {order && (
            <>
              <p><strong>Order:</strong> {order.orderNumber}</p>
              <p><strong>Total:</strong> {formatPrice(order.total)}</p>
            </>
          )}
          <p style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Mail size={16} /> A receipt has been sent to your email.
          </p>
          <div className="success-actions">
            <Link to="/account" className="btn btn-sky">View Order History</Link>
            <Link to="/" className="btn btn-secondary">Continue Shopping</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
