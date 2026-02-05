// scripts/testConnection.js
const mongoose = require('mongoose');
const admin = require('../firebaseAdmin');

async function testConnections() {
  console.log('Testing database connections...\n');
  
  // Test MongoDB
  try {
    await mongoose.connect('mongodb://localhost:27017/smartcity_logistics', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected Successfully');
    
    // Check if Sensor collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const hasSensorCollection = collections.some(coll => coll.name === 'sensors');
    console.log(`📊 Sensor collection exists: ${hasSensorCollection ? '✅' : '❌'}`);
    
  } catch (error) {
    console.log('❌ MongoDB Connection Failed:', error.message);
  }
  
  // Test Firebase
  try {
    const db = admin.firestore();
    console.log('✅ Firebase Admin Initialized');
    
    // Test Firebase connection by getting document count
    const sensorsRef = db.collection('sensors');
    const snapshot = await sensorsRef.limit(1).get();
    console.log(`🔥 Firebase Connection Test: ${snapshot.empty ? 'No sensors found' : 'Connected successfully'}`);
    
  } catch (error) {
    console.log('❌ Firebase Connection Failed:', error.message);
  }
  
  process.exit(0);
}

testConnections();