import { useEffect, useState } from 'react';
import { fetchCategories } from '../../api';
import CategoryCard from '../product/CategoryCard';
import './Categories.css';

const fallbackCategories = [];

export default function Categories() {
  const [categories, setCategories] = useState(fallbackCategories);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  return (
    <section id="categories" className="section categories-section">
      <div className="container">
        <div className="categories-header">
          <div>
            <p className="section-label">Browse</p>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: 0 }}>
              Shop By <span className="serif-italic">Category</span>
            </h2>
          </div>
          <a href="#bestsellers" className="btn btn-secondary categories-view-all">
            View All Products →
          </a>
        </div>
        <div className="categories-grid">
          {categories.map((cat) => (
            <CategoryCard key={cat._id} category={cat} />
          ))}
        </div>
      </div>
    </section>
  );
}
