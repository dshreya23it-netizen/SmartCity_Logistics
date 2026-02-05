// src/pages/admin/ProductManagement.jsx - SIMPLIFIED VERSION
import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs 
} from 'firebase/firestore';
import { firestore } from '../../firebase'; // Only import firestore
import AdminNavbar from '../../components/AdminNavbar';
import './ProductManagement.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    sku: '',
    imageUrl: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsCollection = collection(firestore, 'products');
      const productsSnapshot = await getDocs(productsCollection);
      const productsList = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsList);
      setLoading(false);
    } catch (error) {
      console.error('Error loading products:', error);
      setLoading(false);
      alert('Error loading products: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // CREATE Product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        sku: formData.sku,
        imageUrl: formData.imageUrl || 'https://via.placeholder.com/150',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      };

      await addDoc(collection(firestore, 'products'), productData);
      
      resetForm();
      loadProducts();
      setIsModalOpen(false);
      alert('✅ Product created successfully!');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('❌ Failed to create product: ' + error.message);
    }
  };

  // UPDATE Product
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        sku: formData.sku,
        imageUrl: formData.imageUrl,
        updatedAt: new Date().toISOString()
      };

      const productRef = doc(firestore, 'products', editingProduct.id);
      await updateDoc(productRef, productData);

      resetForm();
      loadProducts();
      setIsModalOpen(false);
      alert('✅ Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('❌ Failed to update product: ' + error.message);
    }
  };

  // DELETE Product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await deleteDoc(doc(firestore, 'products', productId));
      loadProducts();
      alert('✅ Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('❌ Failed to delete product: ' + error.message);
    }
  };

  // EDIT Product
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      sku: product.sku || '',
      imageUrl: product.imageUrl || ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      sku: '',
      imageUrl: ''
    });
    setEditingProduct(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get stats
  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    inStock: products.reduce((sum, p) => sum + (p.stock || 0), 0),
    outOfStock: products.filter(p => (p.stock || 0) === 0).length,
  };

  // Get unique categories
  const uniqueCategories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  // Demo categories for testing
  const demoCategories = [
    'Sensors',
    'Trackers',
    'Security',
    'IoT Devices',
    'Networking',
    'Accessories'
  ];

  return (
    <div className="admin-layout">
      <AdminNavbar />
      
      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">SmartCity LOGISTICS</h1>
            <p className="page-subtitle">Product Management</p>
            <p className="page-description">Full CRUD operations for product management</p>
          </div>
          <button 
            className="add-product-btn"
            onClick={openCreateModal}
          >
            + Add New Product
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Products</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.active}</div>
              <div className="stat-label">Active</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{stats.inStock}</div>
              <div className="stat-label">In Stock</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <div className="stat-value">{stats.outOfStock}</div>
              <div className="stat-label">Out of Stock</div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="search-filter-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="filter-group">
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.filter(cat => cat !== 'all').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <button className="action-btn refresh-btn" onClick={loadProducts}>
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Product List */}
        <div className="product-section">
          <div className="section-header">
            <h2>Product List ({filteredProducts.length})</h2>
            <div className="section-actions">
              <button 
                className="action-btn" 
                onClick={() => alert('Export feature coming soon!')}
              >
                📥 Export
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No products found</h3>
              <p>{products.length === 0 ? 'Add your first product!' : 'Try adjusting your search or filters'}</p>
              <button className="add-product-btn" onClick={openCreateModal}>
                + Add New Product
              </button>
            </div>
          ) : (
            <div className="product-table-container">
              <table className="product-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="product-info-cell">
                        <div className="product-info">
                          <div className="product-avatar">
                            {product.imageUrl ? (
                              <img 
                                src={product.imageUrl} 
                                alt={product.name}
                                className="product-avatar-img"
                              />
                            ) : '📦'}
                          </div>
                          <div>
                            <div className="product-title">{product.name}</div>
                            <div className="product-meta">
                              {product.description?.substring(0, 60) || 'No description'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="product-sku">{product.sku || 'N/A'}</td>
                      <td className="product-category">
                        <span className="category-badge">{product.category || 'Uncategorized'}</span>
                      </td>
                      <td className="product-price">{parseFloat(product.price).toFixed(2)}</td>
                      <td className="product-stock">
                        <div className={`stock-status ${product.stock > 10 ? 'in-stock' : product.stock > 0 ? 'low-stock' : 'out-of-stock'}`}>
                          {product.stock || 0} units
                        </div>
                      </td>
                      <td className="product-status">
                        <span className="status-badge active">{product.status || 'active'}</span>
                      </td>
                      <td className="product-actions">
                        <button 
                          className="action-icon edit" 
                          onClick={() => handleEditProduct(product)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button 
                          className="action-icon delete" 
                          onClick={() => handleDeleteProduct(product.id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button 
                className="modal-close" 
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter product name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description"
                    rows="3"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Price ($) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Stock Quantity *</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {demoCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>SKU (Optional)</label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      placeholder="Product SKU"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Image URL (Optional)</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  <small className="image-hint">
                    Use a placeholder like: https://via.placeholder.com/150
                  </small>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;