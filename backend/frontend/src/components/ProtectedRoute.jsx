// src/components/ProtectedRoute.jsx - UPDATED
import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false, requireManager = false }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const { userRole, loading: roleLoading, isAdmin, isManager } = useAdmin();
  const location = useLocation();

  console.log("🛡️ ProtectedRoute Debug:");
  console.log("- Current User:", currentUser?.email);
  console.log("- User Role:", userRole);
  console.log("- Is Admin:", isAdmin);
  console.log("- Is Manager:", isManager);
  console.log("- Require Admin:", requireAdmin);
  console.log("- Require Manager:", requireManager);
  console.log("- Current Path:", location.pathname);

  // Show loading while checking auth
  if (authLoading || roleLoading) {
    console.log("🛡️ ProtectedRoute - Showing loading screen");
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

  // If no user is logged in, redirect to login
  if (!currentUser) {
    console.log("🛡️ ProtectedRoute - No user, redirecting to login");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check for admin role if required
  if (requireAdmin && !isAdmin) {
    console.log("🛡️ ProtectedRoute - Admin access required, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // Check for manager role if required
  if (requireManager && !isManager && !isAdmin) {
    console.log("🛡️ ProtectedRoute - Manager access required, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  console.log("🛡️ ProtectedRoute - Access granted, showing content");
  return children;
};

// Separate AdminRoute component for clarity
export const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute requireAdmin={true}>
      {children}
    </ProtectedRoute>
  );
};

// Manager route component
export const ManagerRoute = ({ children }) => {
  return (
    <ProtectedRoute requireManager={true}>
      {children}
    </ProtectedRoute>
  );
};

export default ProtectedRoute;