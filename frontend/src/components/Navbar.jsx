import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { userRole } = useAdmin();
  const { cartCount, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const isAdmin = userRole === 'admin';
  const isAdminPage = location.pathname.startsWith('/admin');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    if (loggingOut) return;
    
    setLoggingOut(true);
    setDropdownOpen(false);
    
    try {
      if (clearCart) clearCart();
      
      localStorage.removeItem('cart');
      localStorage.removeItem('userSession');
      
      if (logout) await logout();
      
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Check if link is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Check if admin link is active
  const isAdminActive = (path) => {
    return location.pathname === path;
  };

  // Navigation items for main tabs
  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/solutions', label: 'Solutions', icon: '⚡' },
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/sensors', label: 'Sensors', icon: '🔌' },
    { path: '/shop', label: 'Shop', icon: '🛍️' },
    { path: '/about', label: 'About', icon: 'ℹ️' },
    { path: '/contact', label: 'Contact', icon: '📞' },
  ];

  // Admin panel items
  const adminItems = [
    { path: '/admin/products', label: 'Manage Products', icon: '📦' },
    { path: '/admin-dashboard', label: 'Admin Dashboard', icon: '📈' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Top Bar: Logo + User Actions */}
        <div className="navbar-top">
          {/* Logo Section */}
          <div className="logo-section">
            <Link to="/" className="navbar-brand">
              <div className="logo-container">
                <span className="logo-icon">🏙️</span>
                <div className="logo-text">
                  <span className="logo-primary">SmartCity</span>
                  <span className="logo-secondary">Logistics</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Main Navigation - Desktop */}
          <div className={`nav-main ${mobileMenuOpen ? 'active' : ''}`}>
            <div className="nav-tabs">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-tab ${isActive(item.path) ? 'active' : ''}`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
              {/* Smart City 3D View Link - Integrated into main nav */}
              <Link
                to="/smart-city-3d"
                className={`nav-tab ${isActive('/smart-city-3d') ? 'active' : ''}`}
              >
                <span>🌍</span>
                <span>3D City View</span>
              </Link>
            </div>
          </div>

          {/* Actions Section */}
          <div className="nav-actions">
            {/* Cart */}
            <Link to="/cart" className="cart-btn">
              <span className="cart-icon">🛒</span>
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
              <span className="cart-text">Cart</span>
            </Link>

            {/* User Profile */}
            {currentUser ? (
              <div className={`user-profile ${dropdownOpen ? 'open' : ''}`} ref={dropdownRef}>
                <button className="user-trigger" onClick={toggleDropdown}>
                  <div className="user-avatar">
                    {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="user-details">
                    <span className="user-name">
                      {currentUser?.email?.split('@')[0] || 'User'}
                    </span>
                    <span className="user-role">
                      {isAdmin ? 'Administrator' : 'User'}
                    </span>
                  </div>
                  <span className="chevron">▼</span>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <div className="dropdown-avatar">
                        {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="dropdown-info">
                        <strong>{currentUser?.email?.split('@')[0] || 'User'}</strong>
                        <small>{isAdmin ? 'Administrator Account' : 'User Account'}</small>
                      </div>
                    </div>

                    <Link to="/dashboard" className="dropdown-item">
                      <span className="dropdown-icon">📊</span>
                      Dashboard
                    </Link>

                    <Link to="/orders" className="dropdown-item">
                      <span className="dropdown-icon">📦</span>
                      My Orders
                    </Link>

                    <Link to="/profile" className="dropdown-item">
                      <span className="dropdown-icon">👤</span>
                      Profile Settings
                    </Link>

                    {/* Smart City 3D View in dropdown */}
                    <Link to="/smart-city-3d" className="dropdown-item">
                      <span className="dropdown-icon">🌍</span>
                      3D City View
                    </Link>

                    {isAdmin && (
                      <>
                        <div className="dropdown-divider"></div>
                        <div className="section-label">Admin Panel</div>
                        <Link to="/admin/products" className="dropdown-item admin-item">
                          <span className="dropdown-icon">⚙️</span>
                          Manage Products
                        </Link>
                        <Link to="/admin-dashboard" className="dropdown-item admin-item">
                          <span className="dropdown-icon">📈</span>
                          Admin Dashboard
                        </Link>
                      </>
                    )}

                    <div className="dropdown-divider"></div>
                    <button 
                      onClick={handleLogout} 
                      className="dropdown-item logout-item"
                      disabled={loggingOut}
                    >
                      <span className="dropdown-icon">
                        {loggingOut ? '⏳' : '🚪'}
                      </span>
                      {loggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="login-btn">
                <span>🔐</span>
                <span>Login</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button className="mobile-toggle" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Admin Panel (Second Row - Only for Admin Users) */}
        {isAdmin && (
          <div className="admin-panel">
            <div className="admin-panel-content">
              <div className="admin-panel-left">
                <span className="admin-badge">Admin Panel</span>
                <span className="admin-welcome">
                  Welcome, <strong>{currentUser?.email?.split('@')[0] || 'Admin'}</strong>
                </span>
              </div>
              
              <div className="admin-panel-right">
                <div className="admin-quick-actions">
                  {adminItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`admin-btn ${isAdminActive(item.path) ? 'active' : ''}`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                      {isAdminActive(item.path) && (
                        <span className="btn-badge">ACTIVE</span>
                      )}
                    </Link>
                  ))}
                  {/* Admin can also access 3D view */}
                  <Link
                    to="/smart-city-3d"
                    className={`admin-btn ${isActive('/smart-city-3d') ? 'active' : ''}`}
                  >
                    <span>🌍</span>
                    <span>3D City View</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;