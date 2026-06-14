import { useState } from 'react';
import { Droplets, Mail, MapPin, Phone } from 'lucide-react';
import './Footer.css';

const socials = ['IG', 'FB', 'TW', 'YT'];

export default function Footer() {
  const [email, setEmail] = useState('');

  return (
    <footer id="contact" className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <Droplets size={26} />
              <span>Glowora</span>
            </div>
            <p>
              Premium skincare crafted with love. Clean ingredients, real results,
              and a commitment to your natural glow.
            </p>
            <div className="footer-social">
              {socials.map((s) => (
                <button key={s} className="footer-social-btn">{s}</button>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="footer-links">
            <h4>Quick Links</h4>
            <a href="#home">Home</a>
            <a href="#bestsellers">Shop</a>
            <a href="#categories">Categories</a>
            <a href="#about">About Us</a>
            <a href="#testimonials">Reviews</a>
          </div>

          {/* Support */}
          <div className="footer-links">
            <h4>Support</h4>
            <a href="#contact">Contact</a>
            <a href="#faq">FAQ</a>
            <a href="#shipping">Shipping</a>
            <a href="#returns">Returns</a>
            <a href="#blog">Blog</a>
          </div>

          {/* Contact + Newsletter */}
          <div className="footer-contact">
            <h4>Get In Touch</h4>
            <div className="contact-item">
              <Mail size={15} />
              <span>hello@glowora.com</span>
            </div>
            <div className="contact-item">
              <Phone size={15} />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="contact-item">
              <MapPin size={15} />
              <span>123 Beauty Lane, NY 10001</span>
            </div>
            <div className="footer-newsletter">
              <p>Get exclusive deals in your inbox</p>
              <div className="footer-newsletter-row">
                <input
                  type="email"
                  className="footer-newsletter-input"
                  placeholder="Your email…"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button className="footer-newsletter-btn">Join</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p>© {new Date().getFullYear()} Glowora. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#cookies">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
