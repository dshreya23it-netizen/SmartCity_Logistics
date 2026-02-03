// firebaseAdmin.js
const admin = require('firebase-admin');

// Check if Firebase is already initialized
if (!admin.apps.length) {
  // Make sure you have the service account key JSON file
  const serviceAccount = require('D:\SmartCity_Logistics_RTD\backend\smartcitylogistics-4b6f7-firebase-adminsdk-fbsvc-4813081cdf.json'); // Update this path
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Add your Firebase project configuration
    projectId: process.env.FIREBASE_PROJECT_ID || 'smartcitylogistics-4b6f7',
    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://smartcitylogistics-4b6f7-default-rtdb.firebaseio.com'
  });
}

module.exports = admin;