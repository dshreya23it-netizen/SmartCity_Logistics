// src/components/PublicRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { useAuth } from '../context/AuthContext';
const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAdmin();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  console.log("🌐 PublicRoute - Current User:", currentUser?.email);
  console.log("🌐 PublicRoute - Loading:", loading);

  if (loading) {
    console.log("🌐 PublicRoute - Showing loading");
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div style={{ fontSize: '2rem' }}>⏳</div>
      </div>
    );
  }

  if (currentUser) {
    console.log("🌐 PublicRoute - User exists, redirecting to home");
    return <Navigate to="/" replace />;
  }

  console.log("🌐 PublicRoute - No user, showing login/signup");
  return children;
};

export default PublicRoute;