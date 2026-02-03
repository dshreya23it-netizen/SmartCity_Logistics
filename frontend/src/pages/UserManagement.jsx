// frontend/src/pages/UserManagement.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./UserManagement.css";

const API_URL = 'http://localhost:5000/api';

export default function UserManagement() {
  const { mongoUser, currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminCount: 0,
    todayLogins: 0
  });

  // Check if user is admin
  const isAdmin = mongoUser?.role === 'admin';

  // Load users from MongoDB
  const loadUsers = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/users`),
        fetch(`${API_URL}/users/stats`)
      ]);
      
      const usersData = await usersRes.json();
      const statsData = await statsRes.json();
      
      if (usersData.success) setUsers(usersData.data);
      if (statsData.success) setStats(statsData.data);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  // Update user role
  const updateUserRole = async (userId, currentRole) => {
    if (!isAdmin) return;
    
    const newRole = prompt("Enter new role (user/admin/manager/viewer):", currentRole);
    if (!newRole || newRole === currentRole) return;
    
    try {
      const response = await fetch(`${API_URL}/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert("✅ User role updated!");
        loadUsers();
      }
    } catch (error) {
      alert("❌ Failed to update role");
    }
  };

  // Delete user
  const deleteUser = async (userId, userEmail) => {
    if (!isAdmin) return;
    if (!window.confirm(`Delete user: ${userEmail}?`)) return;
    
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert("✅ User deleted!");
        loadUsers();
      }
    } catch (error) {
      alert("❌ Failed to delete user");
    }
  };

  if (!isAdmin) {
    return (
      <div className="user-management">
        <h1>🔒 Access Denied</h1>
        <p>You need administrator privileges to access this page.</p>
      </div>
    );
  }

  return (
    <div className="user-management">
      <header className="user-header">
        <h1>👥 User Management</h1>
        <p>Manage users in MongoDB database</p>
      </header>

      {/* Stats */}
      <div className="user-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.activeUsers}</h3>
            <p>Active Users</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👑</div>
          <div className="stat-content">
            <h3>{stats.adminCount}</h3>
            <p>Administrators</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.todayLogins}</h3>
            <p>Today's Logins</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <div className="table-header">
          <h2>All Users ({users.length})</h2>
          <button onClick={loadUsers} className="btn-refresh">
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading users from MongoDB...</div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No Users Found</h3>
            <p>Users will appear here after they login</p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>
                    <div className="user-info">
                      {user.photoURL && (
                        <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
                      )}
                      <div>
                        <strong>{user.displayName || 'No Name'}</strong>
                        <small>ID: {user._id.substring(18)}</small>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${user.status}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString() 
                      : 'Never'}
                  </td>
                  <td>
                    <div className="user-actions">
                      <button 
                        onClick={() => updateUserRole(user._id, user.role)}
                        className="btn-action"
                      >
                        🔄 Role
                      </button>
                      <button 
                        onClick={() => deleteUser(user._id, user.email)}
                        className="btn-action btn-delete"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Current User Info */}
      <div className="current-user-info">
        <h3>Your MongoDB Profile</h3>
        {mongoUser && (
          <div className="profile-card">
            <div className="profile-header">
              {currentUser?.photoURL && (
                <img src={currentUser.photoURL} alt="Profile" className="profile-avatar" />
              )}
              <div>
                <h4>{mongoUser.displayName || currentUser?.displayName || 'User'}</h4>
                <p>{mongoUser.email || currentUser?.email}</p>
                <div className="profile-badges">
                  <span className="role-badge role-admin">👑 {mongoUser.role}</span>
                  <span className="status-badge status-active">✅ {mongoUser.status}</span>
                </div>
              </div>
            </div>
            <div className="profile-details">
              <p><strong>Firebase UID:</strong> {currentUser?.uid.substring(0, 20)}...</p>
              <p><strong>MongoDB ID:</strong> {mongoUser._id.substring(18)}</p>
              <p><strong>Login Count:</strong> {mongoUser.loginCount || 1}</p>
              <p><strong>Member Since:</strong> {new Date(mongoUser.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}