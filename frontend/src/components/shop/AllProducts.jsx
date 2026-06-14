import { useEffect, useState } from 'react';
import { fetchProducts } from '../../api';
import ProductCard from '../product/ProductCard';
import './Bestsellers.css';

const FALLBACK_PRODUCTS = [];

export default function AllProducts() {
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchProducts()
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <section id="all-products" className="section bestsellers-section">
      <div className="container">
        <div className="bestsellers-header">
          <div>
            <p className="section-label">Catalog</p>
            <h2 className="section-title inline">All <span className="serif-italic">Products</span></h2>
          </div>
          <div style={{ alignSelf: 'center', color: '#6B7C8D' }}>{products.length} Products</div>
        </div>

        {loading ? (
          <div>Loading…</div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
