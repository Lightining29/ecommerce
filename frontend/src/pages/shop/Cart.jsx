import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice, getProductPrice } from '../../api';
import './Cart.css';

export default function Cart() {
  const { items, cartTotal, removeFromCart, updateQuantity } = useCart();

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container cart-empty">
          <ShoppingBag size={64} strokeWidth={1} />
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/" className="btn btn-sky">
            <ArrowLeft size={18} /> Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} /> Continue Shopping
        </Link>
        <h1 className="cart-title">Shopping Cart</h1>

        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <div key={item._id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <span className="cart-item-price">{formatPrice(getProductPrice(item))}</span>
                </div>
                <div className="cart-item-qty">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>
                    <Minus size={16} />
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                    <Plus size={16} />
                  </button>
                </div>
                <span className="cart-item-total">
                  {formatPrice(getProductPrice(item) * item.quantity)}
                </span>
                <button
                  className="cart-item-remove"
                  onClick={() => removeFromCart(item._id)}
                  aria-label="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span className="free">Free</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <Link to="/checkout" className="btn btn-sky checkout-btn">Proceed to Checkout</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
