import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice, getProductPrice, addToWishlist, removeFromWishlist } from '../../api';
import './ProductCard.css';

export default function ProductCard({ product, onWishlistRemove }) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { isAuthenticated } = useAuth();
  const wished     = isInWishlist(product._id);
  const finalPrice = getProductPrice(product);
  const hasDiscount = product.discountPercent > 0;

  const handleWishlist = async () => {
    toggleWishlist(product);
    if (isAuthenticated) {
      try {
        if (wished) {
          await removeFromWishlist(product._id);
          onWishlistRemove?.();
        } else {
          await addToWishlist(product._id);
        }
      } catch {
        toggleWishlist(product);
      }
    }
  };

  return (
    <div className="product-card">
      <div className="product-image-wrap">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
        />
        {hasDiscount && (
          <span className="discount-badge">-{product.discountPercent}%</span>
        )}
        <button
          className={`wishlist-btn ${wished ? 'active' : ''}`}
          onClick={handleWishlist}
          aria-label="Add to wishlist"
        >
          <Heart size={18} fill={wished ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-rating">
          <Star size={14} fill="#FFD700" color="#FFD700" />
          <span>{product.rating}</span>
          <span className="review-count">({product.reviewCount})</span>
        </div>
        <div className="product-bottom">
          <div className="product-prices">
            <span className="price-current">{formatPrice(finalPrice)}</span>
            {(hasDiscount || product.originalPrice) && (
              <span className="price-original">
                {formatPrice(hasDiscount ? product.price : product.originalPrice)}
              </span>
            )}
          </div>
          <button
            className="add-cart-btn"
            onClick={() => addToCart(product)}
            aria-label="Add to cart"
            disabled={product.inStock === false}
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
