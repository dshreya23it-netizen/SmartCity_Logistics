// src/layouts/AdminLayout.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';

const AdminLayout = ({ children }) => {
  const { currentUser } = useAuth();
  const { isAdmin } = useAdmin();

  // Redirect if not admin
  if (!currentUser || !isAdmin) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="admin-layout">
      {children}
    </div>
  );
};

export default AdminLayout;