import { useEffect, useState } from 'react';
import { ArrowRight, Star, Users, Award } from 'lucide-react';
import { fetchBanner } from '../../api';
import './PromoBanner.css';

const DEFAULT = {
  promoHeading: 'Skincare That Loves You Back',
  promoOffer: 'Flat 20% off on your first order',
  promoImageUrl: null,
};

const stats = [
  { icon: Users, value: '10K+', label: 'Happy Customers' },
  { icon: Star,  value: '4.9',  label: 'Average Rating', stars: true },
  { icon: Award, value: '50+',  label: 'Natural Ingredients' },
];

export default function PromoBanner() {
  const [data, setData] = useState(DEFAULT);

  useEffect(() => {
    fetchBanner()
      .then((b) => setData({ ...DEFAULT, ...b }))
      .catch(() => {});
  }, []);

  // Use the versioned URL from the MongoDB database
  const promoSrc = data.promoImageUrl;

  return (
    <section className="promo-banner">
      <div className="promo-bg-circle promo-bg-circle-1" />
      <div className="promo-bg-circle promo-bg-circle-2" />

      <div className="container promo-grid">
        {/* Left: text */}
        <div className="promo-content">
          <p className="promo-eyebrow">Limited Time Offer</p>
          <h2>
            {data.promoHeading.split(' ').map((word, i) =>
              ['Loves', 'Natural', 'Radiant', 'Glow'].includes(word)
                ? <span key={i} className="serif-italic">{word} </span>
                : word + ' '
            )}
          </h2>
          <p className="promo-offer">
            <span className="promo-offer-pill">{data.promoOffer}</span>
          </p>
          <a href="#bestsellers" className="btn promo-btn" id="promo-shop-btn">
            Shop the Sale <ArrowRight size={18} />
          </a>
        </div>

        {/* Center: binary image from MongoDB */}
        <div className="promo-image">
          <div className="promo-image-ring" />
          {promoSrc ? (
            <img
              src={promoSrc}
              alt="Skincare collection"
            />
          ) : (
            <div style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>
              No image yet
            </div>
          )}
        </div>

        {/* Right: stats */}
        <div className="promo-stats">
          {stats.map(({ icon: Icon, value, label, stars }) => (
            <div key={label} className="promo-stat">
              <div className="promo-stat-icon"><Icon size={20} /></div>
              <div>
                <span className="promo-stat-value">{value}</span>
                {stars && (
                  <div className="promo-stat-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={11} fill="#FFD700" color="#FFD700" />
                    ))}
                  </div>
                )}
                <span className="promo-stat-label">{label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
