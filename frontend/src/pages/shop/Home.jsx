import { useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Hero from '../../components/shop/Hero';
import TrustBar from '../../components/shop/TrustBar';
import Categories from '../../components/shop/Categories';
import PromoBanner from '../../components/shop/PromoBanner';
import Bestsellers from '../../components/shop/Bestsellers';
import AllProducts from '../../components/shop/AllProducts';
import Testimonials from '../../components/shop/Testimonials';
import Footer from '../../components/layout/Footer';
import '../../styles/animations.css';
import './Home.css';

export default function Home() {
  useEffect(() => {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal, .animate-in').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <Hero />

      <div className="reveal">
        <TrustBar />
      </div>

      <div className="stagger reveal">
        <Categories />
      </div>

      <div className="stagger reveal">
        <Bestsellers />
      </div>

      <div className="stagger reveal">
        <AllProducts />
      </div>

      <div className="reveal">
        <PromoBanner />
      </div>

      <div className="reveal">
        <Testimonials />
      </div>

      <section id="about" className="section about-section reveal">
        <div className="container about-content">
          <p className="section-label" style={{ justifyContent: 'center' }}>Our Story</p>
          <h2 className="section-title">
            About <span className="serif-italic">Glowora</span>
          </h2>
          <p className="about-desc">
            We believe skincare should be simple, effective, and kind to both your skin
            and the planet. Every Glowora product is formulated with dermatologist-tested
            ingredients, free from harsh chemicals, and never tested on animals.
          </p>
          <div className="about-pillars">
            {[
              { emoji: '🌿', title: 'Clean Ingredients', desc: 'Only the best from nature' },
              { emoji: '🔬', title: 'Science-Backed', desc: 'Dermatologist tested formulas' },
              { emoji: '♻️', title: 'Eco-Friendly', desc: 'Sustainable packaging' },
              { emoji: '🐰', title: 'Cruelty-Free', desc: 'Never tested on animals' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="about-pillar">
                <span className="about-pillar-emoji">{emoji}</span>
                <h4>{title}</h4>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function HomeLayout() {
  return (
    <>
      <Navbar />
      <Home />
      <Footer />
    </>
  );
}
