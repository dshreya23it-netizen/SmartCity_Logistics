// createAdmin.js - Run this to create an admin user
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Your Firebase config - COPY FROM YOUR firebase.js FILE
const firebaseConfig = {
  apiKey:"AIzaSyAMqzWajDPJ0__aOlw1DimIQeNfi3RVqpQ",
  authDomain: "smartcitylogistics-4b6f7.firebaseapp.com",
  projectId: "smartcitylogistics-4b6f7",
  storageBucket: "smartcitylogistics-4b6f7.firebasestorage.app",
  messagingSenderId: "1084235957683",
  appId: "1:1084235957683:web:b7f13bf9bf51fed568f7c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

const createAdminUser = async () => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      "admin@smartcity.com", 
      "admin123" // Change this password!
    );
    
    const user = userCredential.user;
    console.log("✅ Admin user created in Auth:", user.email);
    console.log("User UID:", user.uid);
    
    // Add admin role to Firestore
    await setDoc(doc(firestore, "users", user.uid), {
      email: user.email,
      displayName: "Administrator",
      role: "admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.log("✅ Admin role added to Firestore");
    console.log("\n📝 Login Credentials:");
    console.log("Email: admin@smartcity.com");
    console.log("Password: admin123");
    console.log("\n⚠️ IMPORTANT: Change the password after first login!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
};

createAdminUser();