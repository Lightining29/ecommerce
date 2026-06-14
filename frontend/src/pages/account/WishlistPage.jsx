import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { fetchWishlist, removeFromWishlist } from '../../api';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/product/ProductCard';
import '../../styles/Panel.css';

export default function WishlistPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toggleWishlist } = useCart();

  useEffect(() => {
    fetchWishlist()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (product) => {
    await removeFromWishlist(product._id);
    toggleWishlist(product);
    setProducts((prev) => prev.filter((p) => p._id !== product._id));
  };

  if (loading) return <div className="loading-spinner" style={{ margin: '40px auto' }} />;

  return (
    <>
      <h1>Wishlist</h1>
      <p className="panel-subtitle">Products you've saved for later</p>

      {products.length === 0 ? (
        <div className="empty-state">
          <Heart size={48} />
          <h3>Your wishlist is empty</h3>
          <p>Tap the heart on any product to save it here.</p>
          <Link to="/" className="btn btn-sky" style={{ marginTop: 16 }}>Browse Products</Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} onWishlistRemove={() => handleRemove(product)} />
          ))}
        </div>
      )}
    </>
  );
}
