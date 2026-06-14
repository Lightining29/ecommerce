import { useEffect, useState } from 'react';
import { fetchAdminContacts, markContactRead, deleteAdminContact } from '../../api';
import '../../styles/Panel.css';
import { CheckCircle, Trash } from 'lucide-react';

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchAdminContacts();
      setContacts(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id) {
    try {
      await markContactRead(id);
      await load();
    } catch (err) {
      console.error(err);
      alert('Failed to mark read');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this message?')) return;
    try {
      await deleteAdminContact(id);
      await load();
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  }

  return (
    <div className="panel" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Messages</h1>
      </div>

      {loading ? <div>Loading…</div> : (
        <div>
          {contacts.length === 0 && <div>No messages yet.</div>}
          <div style={{ display: 'grid', gap: 12 }}>
            {contacts.map((c) => (
              <div key={c._id} className={`panel-card ${c.read ? 'muted' : ''}`} style={{ padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong>{c.name}</strong> <small style={{ color: '#666' }}>· {c.email}</small>
                    <div style={{ color: '#333', marginTop: 6 }}><em>{c.subject}</em></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#666' }}>{new Date(c.createdAt).toLocaleString()}</div>
                    <div style={{ marginTop: 8 }}>
                      {!c.read && <button className="btn-ghost" onClick={() => handleMarkRead(c._id)}><CheckCircle size={14} /> Mark read</button>}
                      <button className="btn-ghost danger" onClick={() => handleDelete(c._id)} style={{ marginLeft: 8 }}><Trash size={14} /> Delete</button>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 10, whiteSpace: 'pre-wrap' }}>{c.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
