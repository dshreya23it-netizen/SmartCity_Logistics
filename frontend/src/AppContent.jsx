// src/AppContent.jsx - CORRECTED
import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useAdmin } from './context/AdminContext';

// Components
import Login from './components/Login';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import ProductManagement from './pages/admin/ProductManagement';

// Pages
import UserManagement from './pages/UserManagement';
import SmartCity3DView from './pages/SmartCity3DView';
import Sensors from './components/Sensors';
import About from './pages/About';
import AdminDashboard from './pages/admin/AdminDashboard';
import EmailDashboard from './pages/admin/EmailDashboard';
import Billing from './pages/Billing';
import Cart from './pages/Cart';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import OrderConfirmation from './pages/OrderConfirmation';
import Orders from './pages/Orders';
import Payment from './pages/Payment';
import Shop from './pages/Shop';
import Signup from './pages/Signup';
import Solutions from './pages/Solutions';
import Test from './pages/Test';

const AppContent = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { userRole } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("=== APP DEBUG ===");
    console.log("Auth User:", currentUser?.email);
    console.log("User Role:", userRole);
    console.log("=================");
  }, [currentUser, userRole]);

  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <h2>Loading SmartCity...</h2>
          <p>Please wait while we prepare your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentUser && <Navbar />}
      
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/test" element={<Test />} />
        
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/solutions" element={<ProtectedRoute><Solutions /></ProtectedRoute>} />
        <Route path="/sensors" element={<ProtectedRoute><Sensors /></ProtectedRoute>} />
        <Route path="/shop" element={<ProtectedRoute><Shop /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
        <Route path="/smart-city-3d" element={<SmartCity3DView />} />
        {/* Admin Routes - These require admin role */}
        <Route path="/admin-dashboard" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute requireAdmin={true}><ProductManagement /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requireAdmin={true}><UserManagement /></ProtectedRoute>} />
       <Route path="/admin/emails" element={<ProtectedRoute requireAdmin={true}><EmailDashboard /></ProtectedRoute>} />
        {/* 404 Page */}
        <Route path="*" element={
          <ProtectedRoute>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2>404 - Page Not Found</h2>
              <p>The page you are looking for does not exist.</p>
              <button 
                onClick={() => navigate('/')} 
                style={{ 
                  padding: '10px 20px', 
                  background: '#667eea', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px', 
                  cursor: 'pointer', 
                  marginTop: '1rem' 
                }}
              >
                Go to Home
              </button>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
};

export default AppContent;