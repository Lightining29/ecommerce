import { useState } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { submitContact } from '../api';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await submitContact(form);
      setStatus({ type: 'success', msg: 'Message sent. We will reply within 24 hours.' });
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus({ type: 'error', msg: 'Failed to send message. Please try again.' });
    } finally {
      setSaving(false);
      setTimeout(() => setStatus(null), 4000);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="container contact-hero-inner">
          <h1>Contact Us</h1>
          <p>Questions? We're here to help. Send a message and we'll respond within 24 hours.</p>
        </div>
      </div>

      <div className="container contact-wrapper">
        <div className="contact-grid">
          <div className="card contact-form">
            {status && <div className={`contact-notice ${status.type}`}>{status.msg}</div>}
            <form onSubmit={handleSubmit} className="form">
              <div className="form-row">
                <div className="form-col">
                  <label>Name</label>
                  <input name="name" placeholder="Your name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="form-col">
                  <label>Email</label>
                  <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                </div>
              </div>

              <label>Subject</label>
              <input name="subject" placeholder="Subject (optional)" value={form.subject} onChange={handleChange} />

              <label>Message</label>
              <textarea name="message" placeholder="Write your message..." rows={6} value={form.message} onChange={handleChange} required />

              <div className="form-actions">
                <button className="btn primary" type="submit" disabled={saving}>
                  {saving ? 'Sending…' : (<><Send size={14} /> Send Message</>)}
                </button>
                <button type="button" className="btn outline" onClick={() => setForm({ name: '', email: '', subject: '', message: '' })}>Clear</button>
              </div>
            </form>
          </div>

          <aside className="card contact-info">
            <h3>Get in touch</h3>
            <p>Prefer direct contact? Use the options below.</p>

            <div className="info-list">
              <div className="info-item">
                <div className="info-icon"><Mail size={18} /></div>
                <div className="info-body">
                  <strong>Email</strong>
                  <a href="mailto:support@glowora.com">support@glowora.com</a>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon"><Phone size={18} /></div>
                <div className="info-body">
                  <strong>Phone</strong>
                  <span>+1 (555) 123-4567</span>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon"><MapPin size={18} /></div>
                <div className="info-body">
                  <strong>Address</strong>
                  <span>123 Glowora Ave, Beauty City</span>
                </div>
              </div>
            </div>

            <div className="hours">
              <strong>Hours</strong>
              <div>Mon – Fri: 9am – 6pm</div>
              <div>Sat: 10am – 3pm</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
