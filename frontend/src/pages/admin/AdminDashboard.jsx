import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Users, AlertCircle } from 'lucide-react';
import { fetchAdminAnalytics, formatPrice, getStatusLabel, getStatusColor } from '../../api';
import '../../styles/Panel.css';

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAdminAnalytics().then(setData).catch(() => {});
  }, []);

  if (!data) return <div className="loading-spinner" style={{ margin: '40px auto' }} />;

  return (
    <>
      <h1>Dashboard</h1>
      <p className="panel-subtitle">Overview of your store performance</p>

      <div className="stats-grid">
        <div className="stat-card highlight">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">{formatPrice(data.totalRevenue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><ShoppingBag size={14} /> Orders</div>
          <div className="stat-value">{data.totalOrders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><Users size={14} /> Customers</div>
          <div className="stat-value">{data.totalUsers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><AlertCircle size={14} /> Pending Approval</div>
          <div className="stat-value" style={{ color: '#F59E0B' }}>{data.pendingApproval}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <h3 style={{ marginBottom: 16 }}>Recent Orders</h3>
          <div className="data-table">
            <table>
              <thead>
                <tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <tr key={o._id}>
                    <td>{o.orderNumber}</td>
                    <td>{o.user?.name || '—'}</td>
                    <td>{formatPrice(o.total)}</td>
                    <td>
                      <span className="status-badge" style={{ background: `${getStatusColor(o.status)}20`, color: getStatusColor(o.status) }}>
                        {getStatusLabel(o.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: 16 }}>Top Products</h3>
          <div className="data-table">
            <table>
              <thead>
                <tr><th>Product</th><th>Sold</th><th>Revenue</th></tr>
              </thead>
              <tbody>
                {data.topProducts.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>{p.sold}</td>
                    <td>{formatPrice(p.revenue)}</td>
                  </tr>
                ))}
                {data.topProducts.length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No sales yet</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {data.lowStock.length > 0 && (
            <>
              <h3 style={{ margin: '24px 0 16px' }}>Low Stock Alert</h3>
              <div className="data-table">
                <table>
                  <thead><tr><th>Product</th><th>Stock</th></tr></thead>
                  <tbody>
                    {data.lowStock.map((p) => (
                      <tr key={p._id}>
                        <td>{p.name}</td>
                        <td style={{ color: '#EF4444', fontWeight: 600 }}>{p.stockQuantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {data.pendingApproval > 0 && (
        <div style={{ marginTop: 24 }}>
          <Link to="/admin/orders" className="btn btn-sky">
            Review {data.pendingApproval} Pending Order{data.pendingApproval > 1 ? 's' : ''}
          </Link>
        </div>
      )}
    </>
  );
}
