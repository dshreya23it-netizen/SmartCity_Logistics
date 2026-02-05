// src/pages/Logout.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './logout.css'; // Create this CSS file

export default function Logout() {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  const { clearCart } = useCart(); // Get clearCart from CartContext
  const [status, setStatus] = useState('Logging out...');

  useEffect(() => {
    const performLogout = async () => {
      try {
        setStatus('Clearing cart...');
        // Clear cart context
        if (clearCart) {
          clearCart();
        }
        
        // Clear localStorage
        localStorage.removeItem('cart');
        localStorage.removeItem('orderHistory');
        localStorage.removeItem('userSession');
        
        setStatus('Signing out from Firebase...');
        // Sign out from Firebase
        if (logout) {
          await logout();
        }
        
        setStatus('Redirecting...');
        // Wait a moment before redirecting
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1000);
        
      } catch (error) {
        console.error('Logout error:', error);
        setStatus('Logout failed. Redirecting...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    };

    // Only run if user is logged in
    if (currentUser) {
      performLogout();
    } else {
      // If no user is logged in, redirect to login
      navigate('/login');
    }
  }, [logout, navigate, clearCart, currentUser]);

  return (
    <div className="logout-container">
      <div className="logout-content">
        <div className="logout-icon">
          {status.includes('failed') ? '❌' : '👋'}
        </div>
        <h1>{status}</h1>
        <div className="logout-spinner"></div>
        <p className="logout-message">
          {status.includes('failed') 
            ? 'Please try logging out again from the navbar.'
            : 'Please wait while we securely sign you out.'}
        </p>
      </div>
    </div>
  );
}