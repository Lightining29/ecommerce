import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { fetchMyOrders, formatPrice, getStatusLabel, getStatusColor } from '../../api';
import '../../styles/Panel.css';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner" style={{ margin: '40px auto' }} />;

  return (
    <>
      <h1>Order History</h1>
      <p className="panel-subtitle">Track your purchases and order status</p>

      {orders.length === 0 ? (
        <div className="empty-state">
          <Package size={48} />
          <h3>No orders yet</h3>
          <p>Start shopping to see your order history here.</p>
          <Link to="/" className="btn btn-sky" style={{ marginTop: 16 }}>Shop Now</Link>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-card-header">
              <div>
                <strong>{order.orderNumber}</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
              </div>
              <span
                className="status-badge"
                style={{ background: `${getStatusColor(order.status)}20`, color: getStatusColor(order.status) }}
              >
                {getStatusLabel(order.status)}
              </span>
            </div>
            <div className="order-items-list">
              {order.items.map((item, i) => (
                <div key={i} className="order-item-row">
                  <img src={item.image} alt={item.name} />
                  <span>{item.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>×{item.quantity}</span>
                  <span style={{ marginLeft: 'auto' }}>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, textAlign: 'right', fontWeight: 700 }}>
              Total: {formatPrice(order.total)}
            </div>
          </div>
        ))
      )}
    </>
  );
}
