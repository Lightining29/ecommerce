import { useEffect, useRef, useState } from 'react';
import { Save, Eye, Type, Palette, RefreshCw, CheckCircle, AlertCircle, Upload, ImagePlus, X } from 'lucide-react';
import { fetchAdminBanner, updateAdminBanner } from '../../api';
import '../../styles/Panel.css';
import './AdminBanner.css';

const DEFAULT_BANNER = {
  heading: 'Reveal Your Natural Glow',
  headingHighlight: 'Natural',
  subheading: 'Discover premium skincare crafted with clean, effective ingredients.',
  badgeText: 'New Collection',
  ctaPrimary: 'Shop Now',
  discountValue: '20%',
  discountLabel: 'OFF',
  discountSub: 'For New Customers',
  promoHeading: 'Skincare That Loves You Back',
  promoOffer: 'Flat 20% off on your first order',
};

const TABS = [
  { id: 'hero',    label: 'Hero Banner',    icon: Type },
  { id: 'promo',   label: 'Promo Section',  icon: Palette },
  { id: 'preview', label: 'Live Preview',   icon: Eye },
];

/* ── Reusable text field ── */
const Field = ({ label, name, value, onChange, placeholder = '' }) => (
  <div className="banner-field">
    <label className="banner-field-label">{label}</label>
    <input
      className="banner-field-input"
      type="text"
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
    />
  </div>
);

/* ── Image upload widget ── */
function ImageUploader({ label, fieldName, existingUrl, file, onFile }) {
  const ref = useRef(null);

  const preview = file
    ? URL.createObjectURL(file)
    : existingUrl || null;

  const handleChange = (e) => {
    const f = e.target.files[0];
    if (f) onFile(fieldName, f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) onFile(fieldName, f);
  };

  const clear = (e) => {
    e.stopPropagation();
    onFile(fieldName, null);
    if (ref.current) ref.current.value = '';
  };

  return (
    <div className="banner-field">
      <label className="banner-field-label">{label}</label>
      <div
        className={`biu-zone ${preview ? 'has-image' : ''}`}
        onClick={() => ref.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {preview ? (
          <>
            <img src={preview} alt="preview" className="biu-preview" />
            <button className="biu-clear" type="button" onClick={clear}>
              <X size={13} /> Remove
            </button>
          </>
        ) : (
          <div className="biu-empty">
            <div className="biu-icon"><ImagePlus size={28} /></div>
            <p className="biu-title">Click or drag photo here</p>
            <p className="biu-hint">JPG, PNG, WEBP — max 5 MB</p>
          </div>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      <button
        type="button"
        className="biu-browse"
        onClick={() => ref.current?.click()}
      >
        <Upload size={13} />
        {preview ? 'Change Photo' : 'Browse Files'}
      </button>
      {file && (
        <p className="biu-filename">📎 {file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
      )}
    </div>
  );
}

export default function AdminBanner() {
  const [form, setForm]         = useState(DEFAULT_BANNER);
  const [existingUrls, setExistingUrls] = useState({ imageUrl: null, promoImageUrl: null });
  const [files, setFiles]       = useState({ image: null, promoImage: null });
  const [activeTab, setActiveTab] = useState('hero');
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetchAdminBanner()
      .then((data) => {
        setForm({ ...DEFAULT_BANNER, ...data });
        // Use the versioned URLs directly from the server response
        setExistingUrls({
          imageUrl:      data.imageUrl      || null,
          promoImageUrl: data.promoImageUrl || null,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (fieldName, file) => {
    setFiles((prev) => ({ ...prev, [fieldName]: file }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Extract only text fields (no imageUrl, promoImageUrl, _id, etc.)
      const textFields = {
        heading: form.heading,
        headingHighlight: form.headingHighlight,
        subheading: form.subheading,
        badgeText: form.badgeText,
        ctaPrimary: form.ctaPrimary,
        discountValue: form.discountValue,
        discountLabel: form.discountLabel,
        discountSub: form.discountSub,
        promoHeading: form.promoHeading,
        promoOffer: form.promoOffer,
      };
      const updated = await updateAdminBanner(textFields, files.image, files.promoImage);
      // Server returns URLs with ?v=newTimestamp — use them directly
      setExistingUrls({
        imageUrl:      updated.imageUrl      || null,
        promoImageUrl: updated.promoImageUrl || null,
      });
      // Clear pending files after save
      setFiles({ image: null, promoImage: null });
      setToast({ type: 'success', msg: 'Banner saved successfully!' });
    } catch {
      setToast({ type: 'error', msg: 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3500);
    }
  };

  const handleReset = () => {
    setForm(DEFAULT_BANNER);
    setFiles({ image: null, promoImage: null });
    setToast({ type: 'success', msg: 'Text reset to defaults.' });
    setTimeout(() => setToast(null), 2500);
  };

  if (loading) return <div className="loading-spinner" style={{ margin: '60px auto' }} />;

  return (
    <div className="admin-banner">
      {/* Toast */}
      {toast && (
        <div className={`banner-toast banner-toast--${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="admin-banner-header">
        <div>
          <h1>Homepage Banner</h1>
          <p className="panel-subtitle">Customize heading, photo and promo content for the home page</p>
        </div>
        <div className="admin-banner-actions">
          <button className="btn-outline-muted" onClick={handleReset}>
            <RefreshCw size={15} /> Reset Text
          </button>
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? <RefreshCw size={15} className="spin" /> : <Save size={15} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="banner-tabs">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`banner-tab ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ── Hero Tab ── */}
      {activeTab === 'hero' && (
        <div className="banner-section-grid">
          {/* Text card */}
          <div className="banner-card">
            <div className="banner-card-header"><Type size={16} /><span>Hero Text</span></div>
            <Field label="Main Heading"                name="heading"          value={form.heading}          onChange={handleChange} placeholder="Reveal Your Natural Glow" />
            <Field label="Highlighted Word (in heading)" name="headingHighlight" value={form.headingHighlight} onChange={handleChange} placeholder="Natural" />
            <Field label="Subheading / Description"   name="subheading"       value={form.subheading}       onChange={handleChange} placeholder="Short tagline under the title" />
            <Field label="Badge Text"                 name="badgeText"        value={form.badgeText}        onChange={handleChange} placeholder="New Collection" />
            <Field label="Primary CTA Button"        name="ctaPrimary"       value={form.ctaPrimary}       onChange={handleChange} placeholder="Shop Now" />
          </div>

          {/* Discount bubble + image card */}
          <div className="banner-card">
            <div className="banner-card-header"><Palette size={16} /><span>Discount Bubble</span></div>
            <div className="banner-discount-preview">
              <div className="bd-circle">
                <span className="bd-value">{form.discountValue || '20%'}</span>
                <span className="bd-label">{form.discountLabel || 'OFF'}</span>
                <span className="bd-sub">{form.discountSub || 'For New Customers'}</span>
              </div>
            </div>
            <Field label="Discount Value" name="discountValue" value={form.discountValue} onChange={handleChange} placeholder="20%" />
            <Field label="Discount Label" name="discountLabel" value={form.discountLabel} onChange={handleChange} placeholder="OFF" />
            <Field label="Sub-text"       name="discountSub"   value={form.discountSub}   onChange={handleChange} placeholder="For New Customers" />
          </div>

          {/* Hero image */}
          <div className="banner-card banner-card--full">
            <div className="banner-card-header"><Upload size={16} /><span>Hero Image</span></div>
            <ImageUploader
              label="Upload hero photo (shown on the right side of the hero section)"
              fieldName="image"
              existingUrl={existingUrls.imageUrl}
              file={files.image}
              onFile={handleFile}
            />
          </div>
        </div>
      )}

      {/* ── Promo Tab ── */}
      {activeTab === 'promo' && (
        <div className="banner-section-grid">
          <div className="banner-card">
            <div className="banner-card-header"><Type size={16} /><span>Promo Text</span></div>
            <Field label="Promo Heading" name="promoHeading" value={form.promoHeading} onChange={handleChange} placeholder="Skincare That Loves You Back" />
            <Field label="Offer Text"    name="promoOffer"   value={form.promoOffer}   onChange={handleChange} placeholder="Flat 20% off on your first order" />
          </div>

          <div className="banner-card">
            <div className="banner-card-header"><Upload size={16} /><span>Promo Image</span></div>
            <ImageUploader
              label="Upload promo section photo"
              fieldName="promoImage"
              existingUrl={existingUrls.promoImageUrl}
              file={files.promoImage}
              onFile={handleFile}
            />
          </div>
        </div>
      )}

      {/* ── Preview Tab ── */}
      {activeTab === 'preview' && (
        <div className="banner-preview-frame">
          <div className="banner-preview-topbar">
            <div className="preview-dot red" /><div className="preview-dot yellow" /><div className="preview-dot green" />
            <span className="preview-url">glowora.com</span>
          </div>
          <div className="banner-preview-content">
            {/* Hero preview */}
            <div className="preview-hero">
              <div className="preview-hero-left">
                <span className="preview-badge">{form.badgeText}</span>
                <h2 className="preview-heading">
                  {form.heading.split(form.headingHighlight).map((part, i, arr) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <em style={{ color: '#3A9BC4', fontStyle: 'italic' }}>{form.headingHighlight}</em>
                      )}
                    </span>
                  ))}
                </h2>
                <p className="preview-sub">{form.subheading}</p>
                <div className="preview-cta">
                  <span className="preview-btn-primary">{form.ctaPrimary} →</span>
                  <span className="preview-btn-ghost">Explore</span>
                </div>
              </div>
              <div className="preview-hero-right">
                {(files.image || existingUrls.imageUrl) ? (
                  <img
                    src={files.image ? URL.createObjectURL(files.image) : existingUrls.imageUrl}
                    alt="Hero"
                    className="preview-hero-img"
                  />
                ) : (
                  <div className="preview-img-placeholder">
                    <ImagePlus size={28} />
                    <span>No image yet</span>
                  </div>
                )}
                <div className="preview-discount-bubble">
                  <span>{form.discountValue}</span>
                  <small>{form.discountLabel}</small>
                </div>
              </div>
            </div>

            {/* Promo preview */}
            <div className="preview-promo">
              <div className="preview-promo-text">
                <h3>{form.promoHeading}</h3>
                <p>{form.promoOffer}</p>
              </div>
              {(files.promoImage || existingUrls.promoImageUrl) ? (
                <img
                  src={files.promoImage ? URL.createObjectURL(files.promoImage) : existingUrls.promoImageUrl}
                  alt="Promo"
                  className="preview-promo-img"
                />
              ) : (
                <div className="preview-img-placeholder small">
                  <ImagePlus size={18} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
