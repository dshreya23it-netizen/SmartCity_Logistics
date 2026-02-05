import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './cart.css';

// FIXED IMPORTS - only import what actually exists
import { firestore } from '../firebase';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch product details from Firestore
 useEffect(() => {
  const fetchProductDetails = async () => {
    if (cart.length === 0) {
      setLoading(false);
      return;
    }

    try {
      // Get product IDs from cart
      const productIds = cart.map(item => item.id);
      
      // Fetch only the products that are in the cart
      const productsCollection = collection(firestore, 'products');
      const productSnapshot = await getDocs(productsCollection);
      
      const productList = productSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(product => productIds.includes(product.id)); // Filter only cart items
      
      // Merge cart items with product details
      const detailedCart = cart.map(cartItem => {
        const product = productList.find(p => p.id === cartItem.id);
        if (product) {
          return {
            ...cartItem,
            name: product.name || cartItem.name,
            description: product.description || '',
            location: product.location || '',
            status: product.status || '',
            stock: product.stock || 0
          };
        }
        return cartItem; // Return original cart item if product not found
      });
      
      setProducts(detailedCart);
      setLoading(false);
    } catch (err) {
      setError('Failed to load cart items');
      setLoading(false);
      console.error('Error fetching cart items:', err);
    }
  };

  fetchProductDetails();
}, [cart]);

  // Handle quantity change
  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      if (newQuantity < 1) {
        removeFromCart(productId);
        return;
      }

      // Check stock availability
      const product = products.find(p => p.id === productId);
      // FIXED: Use firestore instead of db
      const productRef = doc(firestore, 'products', productId);
      const currentProduct = products.find(p => p.id === productId);
      
      if (newQuantity > currentProduct.stock + currentProduct.quantity) {
        setError(`Only ${currentProduct.stock + currentProduct.quantity} units available`);
        return;
      }

      // Update stock in Firestore
      const stockChange = currentProduct.quantity - newQuantity;
      await updateDoc(productRef, {
        stock: currentProduct.stock + stockChange
      });

      // Update cart context
      updateQuantity(productId, newQuantity);
      setError('');
    } catch (err) {
      setError('Failed to update quantity');
      console.error('Error updating quantity:', err);
    }
  };

  // Handle remove item
  const handleRemoveItem = async (productId) => {
    try {
      const product = products.find(p => p.id === productId);
      // FIXED: Use firestore instead of db
      const productRef = doc(firestore, 'products', productId);
      
      // Restore stock in Firestore
      await updateDoc(productRef, {
        stock: product.stock + product.quantity
      });

      // Remove from cart
      removeFromCart(productId);
    } catch (err) {
      setError('Failed to remove item');
      console.error('Error removing item:', err);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = products.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 50;
    const tax = subtotal * 0.12;
    const total = subtotal + shipping + tax;

    return { subtotal, shipping, tax, total };
  };

  const { subtotal, shipping, tax, total } = calculateTotals();

  // Rest of the component (JSX) remains the same...
  // [Keep all your JSX code as is from line 96 onward]

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading cart...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <div className="empty-cart-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some IoT sensors to get started!</p>
        <button className="continue-shopping-btn" onClick={() => navigate('/shop')}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Your Shopping Cart</h1>
        <p className="cart-subtitle">{cart.length} item(s) in cart</p>
      </div>

      {error && (
        <div className="error-alert">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="cart-content">
        <div className="cart-items-section">
          {products.map(item => (
            <div key={item.id} className="cart-item">
              <div className="item-image">
                <div className="image-placeholder">
                  {item.name.charAt(0)}
                </div>
              </div>
              
              <div className="item-details">
                <h3 className="item-name">{item.name}</h3>
                <p className="item-description">{item.description}</p>
                <div className="item-meta">
                  <span className="item-location">📍 {item.location}</span>
                  <span className="item-status">• {item.status}</span>
                </div>
              </div>

              <div className="item-controls">
                <div className="quantity-control">
                  <button
                    className="quantity-btn minus"
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button
                    className="quantity-btn plus"
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <div className="item-price">₹{item.price * item.quantity}</div>

                <button
                  className="remove-btn"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2 className="summary-title">Order Summary</h2>
          
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          
          <div className="summary-row">
            <span>Shipping</span>
            <span>₹{shipping.toFixed(2)}</span>
          </div>
          
          <div className="summary-row">
            <span>Tax (12%)</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          
          <div className="summary-total">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>

          <button
            className="checkout-btn"
            onClick={() => navigate('/billing')}
          >
            Proceed to Checkout
          </button>

          <button
            className="clear-cart-btn"
            onClick={() => {
              clearCart();
              navigate('/shop');
            }}
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;