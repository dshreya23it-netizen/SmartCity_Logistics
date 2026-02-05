// src/context/AdminContext.jsx - SIMPLIFIED & FIXED
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, firestore } from '../firebase';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("🔄 AdminContext: Checking role for user:", user.email);
        console.log("User UID:", user.uid);
        
        try {
          // Check ONLY in Firestore 'users' collection
          const userDoc = await getDoc(doc(firestore, "users", user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("✅ User found in Firestore:", userData);
            
            // Get role from Firestore (default to 'user' if not set)
            const role = userData.role || "user";
            setUserRole(role);
            setUserData({
              ...userData,
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || userData.name || user.email.split('@')[0],
              source: "firestore"
            });
            
            console.log(`👤 User role set to: ${role.toUpperCase()}`);
            
          } else {
            // User not found in Firestore - create default entry
            console.log("❓ User not found in Firestore - creating default");
            
            const defaultUserData = {
              uid: user.uid,
              email: user.email,
              name: user.displayName || user.email.split('@')[0],
              role: "user", // Default to user
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              status: "active"
            };
            
            try {
              await setDoc(doc(firestore, "users", user.uid), defaultUserData);
              console.log("✅ Default user created in Firestore");
            } catch (createError) {
              console.error("Error creating user document:", createError);
            }
            
            setUserRole("user");
            setUserData({
              ...defaultUserData,
              displayName: user.displayName || user.email.split('@')[0],
              source: "default_created"
            });
          }
        } catch (error) {
          console.error("❌ Error checking user role:", error);
          // Fallback to user role
          setUserRole("user");
          setUserData({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || "User",
            role: "user",
            error: error.message
          });
        }
      } else {
        console.log("👤 No user logged in");
        setUserRole(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // For testing: Manually set as admin
  const forceSetAdmin = () => {
    console.log("⚡ Manually setting user as admin");
    setUserRole("admin");
    if (userData) {
      setUserData({
        ...userData,
        role: "admin",
        source: "manual_override"
      });
    }
  };

  const value = {
    userRole,
    userData,
    loading,
    isAdmin: userRole === "admin",
    isManager: userRole === "manager",
    isUser: userRole === "user",
    forceSetAdmin,
    // Helper methods
    hasRole: (role) => userRole === role,
    isAuthenticated: !!userRole
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;