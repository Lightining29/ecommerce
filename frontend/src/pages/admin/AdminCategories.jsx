import { useEffect, useState, useRef } from 'react';
import { Edit, Trash, PlusCircle, Upload, X } from 'lucide-react';
import { fetchAdminCategories, createAdminCategory, updateAdminCategory, deleteAdminCategory } from '../../api';
import '../../styles/Panel.css';

function ImageUploader({ existingUrl, file, onFile }) {
  const ref = useRef(null);
  const preview = file ? URL.createObjectURL(file) : existingUrl || null;
  const handleChange = (e) => { const f = e.target.files[0]; if (f) onFile(f); };
  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        {preview ? (
          <div style={{ position: 'relative' }}>
            <img src={preview} alt="preview" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6 }} />
            <button type="button" onClick={() => onFile(null)} style={{ marginLeft: 8 }}>Remove</button>
          </div>
        ) : (
          <div style={{ color: '#999' }}>No image</div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleChange} />
      <button type="button" onClick={() => ref.current?.click()}><Upload size={14} /> {preview ? 'Change' : 'Upload'}</button>
    </div>
  );
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchAdminCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function startCreate() {
    setEditing(null);
    setName('');
    setFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startEdit(cat) {
    setEditing(cat);
    setName(cat.name || '');
    setFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        await updateAdminCategory(editing._id, { name }, file);
      } else {
        await createAdminCategory({ name }, file);
      }
      await load();
      setEditing(null);
      setName('');
      setFile(null);
    } catch (err) {
      console.error(err);
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this category?')) return;
    try {
      await deleteAdminCategory(id);
      await load();
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  }

  return (
    <div className="panel" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Categories</h1>
        <button className="btn" onClick={startCreate}><PlusCircle size={16} /> New</button>
      </div>

      <div style={{ marginTop: 16, marginBottom: 24, border: '1px solid #eee', padding: 12, borderRadius: 8 }}>
        <h3>{editing ? 'Edit Category' : 'Create Category'}</h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" />
          <ImageUploader existingUrl={editing?.imageUrl} file={file} onFile={setFile} />
          <div>
            <button className="btn" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            {editing && <button className="btn-outline" onClick={() => { setEditing(null); setName(''); setFile(null); }}>Cancel</button>}
          </div>
        </div>
      </div>

      {loading ? <div>Loading…</div> : (
        <table className="panel-table">
          <thead>
            <tr><th>Image</th><th>Name</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c._id}>
                <td style={{ width: 140 }}>
                  {c.imageUrl ? <img src={c.imageUrl} alt={c.name} style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6 }} /> : <div style={{ width: 120, height: 80, background: '#f6f7f8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>No image</div>}
                </td>
                <td>{c.name}</td>
                <td>
                  <button className="btn-ghost" onClick={() => startEdit(c)}><Edit size={14} /> Edit</button>
                  <button className="btn-ghost danger" onClick={() => handleDelete(c._id)}><Trash size={14} /> Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}