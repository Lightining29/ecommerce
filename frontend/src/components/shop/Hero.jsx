import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Leaf, Shield, Heart, Star } from 'lucide-react';
import { fetchBanner } from '../../api';
import './Hero.css';

const DEFAULT_BANNER = {
  heading: 'Reveal Your Natural Glow',
  headingHighlight: 'Natural',
  subheading:
    'Discover premium skincare crafted with clean, effective ingredients. Nourish your skin and embrace the radiance you deserve.',
  badgeText: 'New Collection',
  ctaPrimary: 'Shop Now',
  discountValue: '20%',
  discountLabel: 'OFF',
  discountSub: 'For New Customers',
  imageUrl: null,
};

const FALLBACK_IMAGE = null;

const badges = [
  { icon: Leaf,   label: 'Natural Ingredients' },
  { icon: Shield, label: 'Dermatologist Tested' },
  { icon: Heart,  label: 'Cruelty Free' },
];

function buildTitle(heading, highlight) {
  if (!highlight || !heading.includes(highlight)) return <>{heading}</>;
  const parts = heading.split(highlight);
  return (
    <>
      {parts[0]}
      <span className="hero-title-highlight">{highlight}</span>
      {parts[1]}
    </>
  );
}

export default function Hero() {
  const [banner, setBanner] = useState(DEFAULT_BANNER);

  useEffect(() => {
    fetchBanner()
      .then((data) => setBanner({ ...DEFAULT_BANNER, ...data }))
      .catch(() => {});
  }, []);

  const heroSrc = banner.imageUrl || FALLBACK_IMAGE;

  return (
    <section id="home" className="hero">
      <div className="hero-bg">
        <div className="hero-bg-blob blob-1" />
        <div className="hero-bg-blob blob-2" />
        <div className="hero-bg-blob blob-3" />
      </div>

      <div className="container hero-grid">
        <div className="hero-content animate-in">
          <span className="hero-tag">
            <Sparkles size={12} />
            {banner.badgeText}
          </span>

          <h1 className="hero-title">
            {buildTitle(banner.heading, banner.headingHighlight)}
          </h1>

          <p className="hero-desc">{banner.subheading}</p>

          <div className="hero-actions">
            <a href="#bestsellers" className="btn btn-hero-primary" id="hero-shop-now">
              {banner.ctaPrimary} <ArrowRight size={18} />
            </a>
            <a href="#categories" className="btn btn-hero-ghost" id="hero-explore">
              Explore Categories
            </a>
          </div>

          <div className="hero-badges">
            {badges.map(({ icon: Icon, label }) => (
              <div key={label} className="hero-badge">
                <span className="hero-badge-icon"><Icon size={16} /></span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual animate-in" style={{ animationDelay: '0.2s' }}>
          <div className="hero-image-wrap">
            {heroSrc ? (
              <img
                src={heroSrc}
                alt="Premium skincare"
                className="hero-image"
              />
            ) : (
              <div style={{ 
                width: '100%', 
                height: '100%', 
                backgroundColor: '#f0f0f0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#999'
              }}>
                No image yet
              </div>
            )}

            <div className="hero-discount">
              <span className="discount-value">{banner.discountValue}</span>
              <span className="discount-label">{banner.discountLabel}</span>
              <span className="discount-sub">{banner.discountSub}</span>
            </div>

            <div className="hero-rating-card">
              <div className="hero-rating-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} fill="#FFD700" color="#FFD700" />
                ))}
              </div>
              <span className="hero-rating-value">4.9 Rating</span>
              <span className="hero-rating-count">10K+ Reviews</span>
            </div>
          </div>

          <div className="hero-blob-main" />
          <div className="hero-blob-secondary" />
        </div>
      </div>

      <div className="hero-scroll-hint">
        <div className="scroll-dot" />
      </div>
    </section>
  );
}
