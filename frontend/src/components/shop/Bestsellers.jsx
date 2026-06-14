import { useEffect, useState } from 'react';
import { fetchProducts } from '../../api';
import ProductCard from '../product/ProductCard';
import './Bestsellers.css';

const FALLBACK_PRODUCTS = [];

export default function Bestsellers() {
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);

  useEffect(() => {
    fetchProducts({ bestseller: 'true', limit: '4' })
      .then((data) => {
        if (data && data.length > 0) setProducts(data);
      })
      .catch(() => {});
  }, []);

  return (
    <section id="bestsellers" className="section bestsellers-section">
      <div className="container">
        <div className="bestsellers-header">
          <div>
            <p className="section-label">Top Picks</p>
            <h2 className="section-title inline">
              Our <span className="serif-italic">Bestsellers</span>
            </h2>
          </div>
          <a href="#bestsellers" className="btn btn-secondary view-all">
            View All Products →
          </a>
        </div>
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
