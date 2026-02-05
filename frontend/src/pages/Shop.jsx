import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import './shop.css';

// FIXED IMPORTS - use only what's actually exported
import { firestore } from '../firebase';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const { addToCart } = useCart();

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // FIXED: Use firestore instead of db
        const productsCollection = collection(firestore, 'products');
        const productSnapshot = await getDocs(productsCollection);
        const productList = productSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setProducts(productList);
        setFilteredProducts(productList);
        setLoading(false);
      } catch (err) {
        setError('Failed to load products. Please try again.');
        setLoading(false);
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, []);

  // Filter products by category
  const filterProducts = (category) => {
    setActiveCategory(category);
    if (category === 'all') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
      setFilteredProducts(filtered);
    }
  };

  // Handle add to cart
  const handleAddToCart = async (product) => {
    try {
      // Check stock availability
      if (product.stock <= 0) {
        setError('Product is out of stock');
        return;
      }

      // Add to cart context
      addToCart(product);
      
      // Update stock in Firestore - FIXED: Use firestore instead of db
      const productRef = doc(firestore, 'products', product.id);
      await updateDoc(productRef, {
        stock: product.stock - 1
      });
      
      // Update local state
      const updatedProducts = products.map(p => 
        p.id === product.id ? { ...p, stock: p.stock - 1 } : p
      );
      setProducts(updatedProducts);
      
      // Show success message
      setError('');
    } catch (err) {
      setError('Failed to add item to cart. Please try again.');
      console.error('Error adding to cart:', err);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="shop-container">
      <div className="shop-header">
        <h1>Smart City IoT Store</h1>
        <p className="shop-subtitle">
          Browse and purchase IoT sensors for your smart city needs
        </p>
      </div>

      {error && (
        <div className="error-alert">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="category-filters">
        <button
          className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => filterProducts('all')}
        >
          All Products
        </button>
        <button
          className={`category-btn ${activeCategory === 'water' ? 'active' : ''}`}
          onClick={() => filterProducts('water')}
        >
          Water
        </button>
        <button
          className={`category-btn ${activeCategory === 'energy' ? 'active' : ''}`}
          onClick={() => filterProducts('energy')}
        >
          Energy
        </button>
        <button
          className={`category-btn ${activeCategory === 'temperature' ? 'active' : ''}`}
          onClick={() => filterProducts('temperature')}
        >
          Temperature
        </button>
      </div>

      <div className="products-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-header">
              <h3>{product.name}</h3>
              <p className="product-description">{product.description}</p>
            </div>
            
            <div className="product-details">
              <div className="detail-row">
                <span className="detail-label">Location:</span>
                <span className="detail-value">{product.location}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Stock:</span>
                <span className={`detail-value ${product.stock < 10 ? 'low-stock' : ''}`}>
                  {product.stock} units
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className="status-badge active">
                  {product.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Added:</span>
                <span className="detail-value">{product.added}</span>
              </div>
            </div>

            <div className="product-footer">
              <div className="product-price">{product.price}</div>
              <button
                className={`add-to-cart-btn ${product.stock <= 0 ? 'disabled' : ''}`}
                onClick={() => handleAddToCart(product)}
                disabled={product.stock <= 0}
              >
                {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="no-products">
          <p>No products found in this category.</p>
        </div>
      )}
    </div>
  );
};

export default ShopPage;