// src/components/AdminNavbar.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminNavbar.css';

const AdminNavbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const userInitial = currentUser?.email?.charAt(0).toUpperCase() || 'A';

  const adminMenuItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/products', icon: '📦', label: 'Products' },
    { path: '/admin/categories', icon: '🏷️', label: 'Categories' },
    { path: '/admin/orders', icon: '📋', label: 'Orders' },
    { path: '/admin/users', icon: '👥', label: 'Users' },
    { path: '/admin/analytics', icon: '📈', label: 'Analytics' },
    { path: '/admin/settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <>
      {/* Top Navbar */}
      <nav className="admin-navbar">
        <div className="navbar-left">
          <button 
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          
          <Link to="/admin/dashboard" className="brand">
            <span className="brand-icon">🏙️</span>
            <div className="brand-text">
              <span className="brand-main">SmartCity</span>
              <span className="brand-sub">LOGISTICS</span>
              <span className="admin-badge">ADMIN</span>
            </div>
          </Link>
        </div>

        <div className="navbar-right">
          {/* Quick Actions */}
          <div className="quick-actions">
            <button className="action-btn" title="Notifications">
              <span className="action-icon">🔔</span>
              <span className="badge">3</span>
            </button>
            <button className="action-btn" title="Messages">
              <span className="action-icon">💬</span>
            </button>
            <button className="action-btn" title="Help">
              <span className="action-icon">❓</span>
            </button>
          </div>

          {/* User Profile */}
          <div className="user-profile">
            <button 
              className="user-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="user-avatar admin">{userInitial}</div>
              <div className="user-info">
                <div className="user-name">{currentUser?.email?.split('@')[0]}</div>
                <div className="user-role">Administrator</div>
              </div>
              <span className="dropdown-arrow">▼</span>
            </button>

            {dropdownOpen && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">{userInitial}</div>
                  <div>
                    <div className="dropdown-email">{currentUser?.email}</div>
                    <div className="dropdown-role">Admin Account</div>
                  </div>
                </div>
                <Link to="/admin/emails" className="nav-tab">
                    <span>📧</span>
                    <span>Email Logs</span>
                </Link>
                
                <div className="dropdown-divider"></div>
                
                <Link to="/admin/profile" className="dropdown-item">
                  <span className="item-icon">👤</span> My Profile
                </Link>
                <Link to="/admin/settings" className="dropdown-item">
                  <span className="item-icon">⚙️</span> Account Settings
                </Link>
                
                <div className="dropdown-divider"></div>
                
                <Link to="/" className="dropdown-item">
                  <span className="item-icon">🏠</span> View Website
                </Link>
                
                <div className="dropdown-divider"></div>
                
                <button onClick={handleLogout} className="logout-btn">
                  <span className="item-icon">🚪</span> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h3 className="sidebar-title">Admin Panel</h3>
          <div className="sidebar-subtitle">Management Console</div>
        </div>

        <nav className="sidebar-menu">
          {adminMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
              {item.path === '/admin/products' && <span className="menu-badge">3</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="system-status">
            <div className="status-indicator online"></div>
            <span>System Status: Online</span>
          </div>
          <div className="last-login">
            Last login: Today, 10:30 AM
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminNavbar;