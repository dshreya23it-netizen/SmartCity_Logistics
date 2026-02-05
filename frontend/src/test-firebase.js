// src/test-firebase.js
import { auth, database, firestore } from './firebase.js';

console.log("🔥 Firebase Test:");
console.log("Database:", database ? "✅ Exists" : "❌ Missing");
console.log("Firestore:", firestore ? "✅ Exists" : "❌ Missing");
console.log("Auth:", auth ? "✅ Exists" : "❌ Missing");