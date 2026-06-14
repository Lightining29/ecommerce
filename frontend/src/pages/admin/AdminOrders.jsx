import { useEffect, useState } from 'react';
import { fetchAdminOrders, approveOrder, shipOrder, formatPrice, getStatusLabel, getStatusColor } from '../../api';
import '../../styles/Panel.css';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetchAdminOrders().then(setOrders).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleApprove = async (id) => {
    await approveOrder(id);
    load();
  };

  const handleShip = async (id) => {
    await shipOrder(id);
    load();
  };

  if (loading) return <div className="loading-spinner" style={{ margin: '40px auto' }} />;

  return (
    <>
      <h1>Orders</h1>
      <p className="panel-subtitle">View and manage customer orders</p>

      {orders.length === 0 ? (
        <div className="empty-state"><p>No orders yet</p></div>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-card-header">
              <div>
                <strong>{order.orderNumber}</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  {order.user?.name} — {order.user?.email}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="status-badge" style={{ background: `${getStatusColor(order.status)}20`, color: getStatusColor(order.status) }}>
                  {getStatusLabel(order.status)}
                </span>
                <strong>{formatPrice(order.total)}</strong>
              </div>
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
            {order.shippingAddress && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 12 }}>
                Ship to: {order.shippingAddress.fullName}, {order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.zip}
              </p>
            )}
            <div className="panel-actions" style={{ marginTop: 16 }}>
              {order.status === 'paid' && (
                <button className="btn btn-sm btn-approve" onClick={() => handleApprove(order._id)}>
                  Approve Order
                </button>
              )}
              {order.status === 'approved' && (
                <button className="btn btn-sm btn-ship" onClick={() => handleShip(order._id)}>
                  Mark Shipped
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </>
  );
}
