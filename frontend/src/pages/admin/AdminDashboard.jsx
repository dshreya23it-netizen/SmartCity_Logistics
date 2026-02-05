// src/pages/AdminDashboard.jsx - WORKING VERSION (NO HOOKS)
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { productAPI } from "../../services/api"; // Remove dashboardAPI import
import "./AdminDashboard.css";

// Sensor type icons mapping
const SENSOR_ICONS = {
  temperature: "🌡️",
  humidity: "💧",
  pressure: "📊",
  "air-quality": "💨",
  motion: "🚶",
  light: "💡",
  sound: "🔊",
  "water-level": "🌊",
  traffic: "🚦",
  energy: "⚡",
  security: "🔒"
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("sensors");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [stats, setStats] = useState({
    totalSensors: 0,
    activeSensors: 0,
    lowStock: 0,
    totalValue: 0
  });
  
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    type: "temperature",
    price: "",
    stock: "",
    location: { address: "" },
    status: "active",
    isSensor: true,
    sensorId: "",
    category: "sensors",
    specs: {
      accuracy: "",
      range: "",
      power: "",
      connectivity: "WiFi"
    }
  });

  // Check admin status
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    loadProducts();
  }, [currentUser, navigate]);

  // Load products directly
  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productAPI.getProducts();
      console.log("Products response:", response); // Debug log
      
      if (response.success) {
        setProducts(response.data || []);
        
        // Calculate stats
        const sensorProducts = response.data.filter(p => p.isSensor);
        const activeSensors = sensorProducts.filter(p => p.status === "active").length;
        const lowStock = sensorProducts.filter(p => p.stock < 10).length;
        const totalValue = sensorProducts.reduce((sum, p) => sum + (p.price || 0) * (p.stock || 0), 0);
        
        setStats({
          totalSensors: sensorProducts.length,
          activeSensors,
          lowStock,
          totalValue
        });
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setError("Failed to load products: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form changes
  const handleProductChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith("specs.")) {
      const field = name.split(".")[1];
      setProductForm({
        ...productForm,
        specs: { ...productForm.specs, [field]: value }
      });
    } else if (name.startsWith("location.")) {
      const field = name.split(".")[1];
      setProductForm({
        ...productForm,
        location: { ...productForm.location, [field]: value }
      });
    } else {
      setProductForm({ ...productForm, [name]: value });
    }
  };

  // ADD PRODUCT TO MONGODB
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!productForm.name || !productForm.price || !productForm.stock) {
        throw new Error("Please fill all required fields");
      }

      // Prepare data for MongoDB
      const mongoData = {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        type: productForm.type,
        sensorType: productForm.type,
        isSensor: true,
        sensorId: productForm.sensorId || `SENSOR-${Date.now()}`,
        status: productForm.status,
        category: "sensors",
        location: productForm.location.address ? { address: productForm.location.address } : undefined,
        specs: productForm.specs,
        addedBy: currentUser?.email || "Admin"
      };

      console.log("Sending to MongoDB:", mongoData); // Debug log

      // Send to MongoDB via backend API
      const response = await productAPI.createProduct(mongoData);
      console.log("Create response:", response); // Debug log
      
      if (response.success) {
        setSuccess("✅ Sensor saved to MongoDB!");
        setProductForm({
          name: "", description: "", type: "temperature", price: "", stock: "",
          location: { address: "" }, status: "active", sensorId: "", category: "sensors",
          specs: { accuracy: "", range: "", power: "", connectivity: "WiFi" }
        });
        loadProducts(); // Refresh the list
      } else {
        throw new Error(response.message || "Failed to save");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setError("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // DELETE FROM MONGODB
  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Delete ${productName} from MongoDB?`)) return;
    
    try {
      const response = await productAPI.deleteProduct(productId);
      if (response.success) {
        setSuccess("✅ Deleted from MongoDB!");
        loadProducts();
      }
    } catch (error) {
      setError("❌ Delete failed: " + error.message);
    }
  };

  // UPDATE STATUS IN MONGODB
  const handleUpdateStatus = async (productId, currentStatus) => {
    const newStatus = prompt("New status (active/inactive):", currentStatus);
    if (!newStatus || newStatus === currentStatus) return;
    
    try {
      const response = await productAPI.updateProduct(productId, { status: newStatus });
      if (response.success) {
        setSuccess("✅ Status updated!");
        loadProducts();
      }
    } catch (error) {
      setError("❌ Update failed");
    }
  };

  // EDIT PRODUCT
  const handleEditProduct = (product) => {
    setProductForm({
      name: product.name,
      description: product.description || "",
      type: product.sensorType || product.type || "temperature",
      price: product.price?.toString() || "",
      stock: product.stock?.toString() || "",
      location: { address: product.location?.address || "" },
      status: product.status || "active",
      sensorId: product.sensorId || "",
      category: product.category || "sensors",
      specs: product.specs || { accuracy: "", range: "", power: "", connectivity: "WiFi" }
    });
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-layout">
        {/* Header */}
        <header className="admin-header">
          <div className="header-content">
            <h1 className="main-title">📡 MongoDB Sensor Dashboard</h1>
            <p className="subtitle">Connected to MongoDB Database</p>
          </div>
        </header>

        {/* Stats */}
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">📡</div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.totalSensors}</h3>
              <p className="stat-label">Total Sensors</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.activeSensors}</h3>
              <p className="stat-label">Active</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3 className="stat-number">₹{stats.totalValue}</h3>
              <p className="stat-label">Total Value</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {success && <div className="alert alert-success">✅ {success}</div>}
        {error && <div className="alert alert-error">❌ {error}</div>}

        {/* Main Content */}
        <main className="main-content">
          {/* Add Sensor Form */}
          <div className="form-card">
            <h2>➕ Add New Sensor to MongoDB</h2>
            <form onSubmit={handleAddProduct}>
              <input
                type="text"
                name="name"
                value={productForm.name}
                onChange={handleProductChange}
                placeholder="Sensor Name"
                required
                className="form-input"
              />
              
              <select 
                name="type" 
                value={productForm.type} 
                onChange={handleProductChange}
                className="form-select"
              >
                <option value="temperature">🌡️ Temperature</option>
                <option value="humidity">💧 Humidity</option>
                <option value="air-quality">💨 Air Quality</option>
              </select>
              
              <input
                type="number"
                name="price"
                value={productForm.price}
                onChange={handleProductChange}
                placeholder="Price"
                required
                className="form-input"
              />
              
              <input
                type="number"
                name="stock"
                value={productForm.stock}
                onChange={handleProductChange}
                placeholder="Stock"
                required
                className="form-input"
              />
              
              <input
                type="text"
                name="sensorId"
                value={productForm.sensorId}
                onChange={handleProductChange}
                placeholder="Sensor ID (optional)"
                className="form-input"
              />
              
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? "Saving..." : "💾 Save to MongoDB"}
              </button>
            </form>
          </div>

          {/* Sensors List */}
          <div className="sensors-list-section">
            <h2>📋 Sensors in MongoDB ({products.length})</h2>
            <button onClick={loadProducts} className="btn btn-sm">
              🔄 Refresh
            </button>
            
            {loading ? (
              <p>Loading from MongoDB...</p>
            ) : products.length === 0 ? (
              <p>No sensors found in MongoDB</p>
            ) : (
              <div className="sensors-grid">
                {products.filter(p => p.isSensor).map(product => (
                  <div key={product._id} className="sensor-card">
                    <h3>{product.name}</h3>
                    <p>Type: {SENSOR_ICONS[product.sensorType]} {product.sensorType}</p>
                    <p>Price: ₹{product.price}</p>
                    <p>Stock: {product.stock}</p>
                    <p>Status: {product.status}</p>
                    <p>ID: {product.sensorId || product._id?.substring(0, 8)}</p>
                    
                    <div className="sensor-actions">
                      <button 
                        onClick={() => handleEditProduct(product)}
                        className="btn-action"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(product._id, product.status)}
                        className="btn-action"
                      >
                        🔄 Status
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product._id, product.name)}
                        className="btn-action btn-delete"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}