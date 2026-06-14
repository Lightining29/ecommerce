import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, ImagePlus } from 'lucide-react';
import { fetchAdminCategories, createProduct, updateProduct, fetchAdminProducts } from '../../api';
import '../../styles/Panel.css';
import '../auth/Auth.css';
import './AdminProductForm.css';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  originalPrice: '',
  category: '',
  stockQuantity: 50,
  discountPercent: 0,
  bestseller: false,
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);       // new File chosen
  const [previewUrl, setPreviewUrl] = useState(null);     // local blob or existing API URL
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAdminCategories().then(setCategories);
    if (isEdit) {
      fetchAdminProducts().then((products) => {
        const p = products.find((x) => x._id === id);
        if (p) {
          setForm({
            name: p.name,
            description: p.description,
            price: p.price,
            originalPrice: p.originalPrice || '',
            category: p.category?._id || p.category,
            stockQuantity: p.stockQuantity,
            discountPercent: p.discountPercent || 0,
            bestseller: p.bestseller,
          });
          // p.image is already the /api/images/product/:id path
          if (p.image) setPreviewUrl(p.image);
        }
      });
    }
  }, [id, isEdit]);

  const update = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    // Revoke previous object URL to avoid memory leak
    if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isEdit && !imageFile) {
      setError('Please upload a product image.');
      return;
    }

    setLoading(true);
    try {
      const fields = {
        ...form,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : '',
        stockQuantity: parseInt(form.stockQuantity, 10),
        discountPercent: parseInt(form.discountPercent, 10) || 0,
        bestseller: form.bestseller,
      };

      if (isEdit) await updateProduct(id, fields, imageFile || null);
      else await createProduct(fields, imageFile);

      navigate('/admin/products');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>{isEdit ? 'Edit Product' : 'Add Product'}</h1>
      <p className="panel-subtitle">
        {isEdit ? 'Update product details and image' : 'Create a new product listing'}
      </p>

      <form className="product-form" onSubmit={handleSubmit}>
        {error && <div className="auth-error">{error}</div>}

        <div className="apf-grid">
          {/* Left column — fields */}
          <div className="apf-fields">
            <div className="apf-group">
              <label>Product Name *</label>
              <input value={form.name} onChange={update('name')} required placeholder="e.g. Vitamin C Serum" />
            </div>

            <div className="apf-group">
              <label>Description *</label>
              <textarea
                value={form.description}
                onChange={update('description')}
                required
                rows={4}
                placeholder="Describe the product benefits…"
              />
            </div>

            <div className="apf-row">
              <div className="apf-group">
                <label>Price ($) *</label>
                <input type="number" step="0.01" min="0" value={form.price} onChange={update('price')} required />
              </div>
              <div className="apf-group">
                <label>Original Price ($)</label>
                <input type="number" step="0.01" min="0" value={form.originalPrice} onChange={update('originalPrice')} placeholder="Before discount" />
              </div>
            </div>

            <div className="apf-row">
              <div className="apf-group">
                <label>Category *</label>
                <select value={form.category} onChange={update('category')} required>
                  <option value="">Select category…</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="apf-group">
                <label>Stock Quantity</label>
                <input type="number" min="0" value={form.stockQuantity} onChange={update('stockQuantity')} />
              </div>
            </div>

            <div className="apf-row">
              <div className="apf-group">
                <label>Discount (%)</label>
                <input type="number" min="0" max="100" value={form.discountPercent} onChange={update('discountPercent')} />
              </div>
              <div className="apf-group apf-check">
                <label className="apf-checkbox-label">
                  <input type="checkbox" checked={form.bestseller} onChange={update('bestseller')} />
                  <span>Mark as Bestseller</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right column — image upload */}
          <div className="apf-image-col">
            <label className="apf-section-label">Product Image {!isEdit && '*'}</label>

            {/* Drop zone */}
            <div
              className={`apf-dropzone ${previewUrl ? 'has-image' : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="apf-preview-img" />
                  <button
                    type="button"
                    className="apf-clear-btn"
                    onClick={(e) => { e.stopPropagation(); clearImage(); }}
                  >
                    <X size={14} /> Remove
                  </button>
                </>
              ) : (
                <div className="apf-dropzone-empty">
                  <div className="apf-drop-icon">
                    <ImagePlus size={36} />
                  </div>
                  <p className="apf-drop-title">Drag & drop or click to upload</p>
                  <p className="apf-drop-hint">JPG, PNG, WEBP — Max 5 MB</p>
                </div>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <button
              type="button"
              className="apf-browse-btn"
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={15} />
              {previewUrl ? 'Change Photo' : 'Browse Files'}
            </button>

            {imageFile && (
              <p className="apf-file-name">
                📎 {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        </div>

        <div className="apf-actions">
          <button type="submit" className="btn btn-sky" disabled={loading}>
            {loading ? 'Saving…' : isEdit ? '✓ Update Product' : '+ Create Product'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/products')}>
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
