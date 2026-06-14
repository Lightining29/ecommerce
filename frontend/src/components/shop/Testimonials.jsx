import { Star, Quote } from 'lucide-react';
import './Testimonials.css';

const reviews = [];

export default function Testimonials() {
  return (
    <section id="testimonials" className="section testimonials-section">
      <div className="container">
        <div style={{ textAlign: 'center' }}>
          <p className="section-label" style={{ justifyContent: 'center' }}>Reviews</p>
          <h2 className="section-title">
            What Our <span className="serif-italic">Customers</span> Say
          </h2>
        </div>
        <div className="testimonials-grid">
          {reviews.map((review, i) => (
            <div
              key={review.id}
              className="testimonial-card"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="testimonial-quote">
                <Quote size={28} />
              </div>
              <div className="testimonial-stars">
                {[...Array(review.rating)].map((_, si) => (
                  <Star key={si} size={14} fill="#FFD700" color="#FFD700" />
                ))}
              </div>
              <p className="testimonial-text">"{review.text}"</p>
              <div className="testimonial-product">
                <span>✓ Purchased:</span> {review.product}
              </div>
              <div className="testimonial-author">
                <img src={review.avatar} alt={review.name} className="testimonial-avatar" />
                <div>
                  <p className="testimonial-name">{review.name}</p>
                  <p className="testimonial-role">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary rating bar */}
        <div className="rating-summary">
          <div className="rating-summary-score">
            <span className="score-big">4.9</span>
            <div className="score-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill="#FFD700" color="#FFD700" />
              ))}
            </div>
            <span className="score-count">Based on 10,000+ reviews</span>
          </div>
          <div className="rating-bars">
            {[
              { label: '5 stars', pct: 84 },
              { label: '4 stars', pct: 11 },
              { label: '3 stars', pct: 3 },
              { label: '2 stars', pct: 1 },
              { label: '1 star',  pct: 1 },
            ].map(({ label, pct }) => (
              <div key={label} className="rating-bar-row">
                <span className="rating-bar-label">{label}</span>
                <div className="rating-bar-track">
                  <div className="rating-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="rating-bar-pct">{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
