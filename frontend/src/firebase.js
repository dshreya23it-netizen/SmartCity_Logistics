// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database"; // ADD THIS LINE
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // Your Firebase config here
 apiKey: "AIzaSyAMqzWajDPJ0__aOlw1DimIQeNfi3RVqpQ",
  authDomain: "smartcitylogistics-4b6f7.firebaseapp.com",
  databaseURL: "https://smartcitylogistics-4b6f7-default-rtdb.firebaseio.com",
  projectId: "smartcitylogistics-4b6f7",
  storageBucket: "smartcitylogistics-4b6f7.firebasestorage.app",
  messagingSenderId: "1084235957683",
  appId: "1:1084235957683:web:b7f13bf9bf51fed568f7c6",
  measurementId: "G-ZSB6R72ED7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const database = getDatabase(app); // ADD THIS LINE

export { auth, database, firestore }; // EXPORT ALL THREE
