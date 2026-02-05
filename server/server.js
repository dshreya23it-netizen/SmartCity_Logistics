// backend/server.js - Add user routes
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://dshreya23it_db_user:5SkbO2Jw9zoCzBWF@cluster0.7y5klyp.mongodb.net/smartCity_logistics?retryWrites=true&w=majority')
  .then(() => console.log('✅ MongoDB Atlas Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Import models
const Product = require('./models/Product');
const User = require('./models/User');

// Import controllers
const userController = require('./controllers/userController');

// ============ PRODUCT ROUTES (Existing) ============
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ============ USER ROUTES (NEW) ============

// Sync Firebase user to MongoDB (call this after Firebase login)
app.post('/api/users/sync', userController.syncFirebaseUser);

// Get all users (admin only)
app.get('/api/users', userController.getAllUsers);

// Get user stats
app.get('/api/users/stats', userController.getUserStats);

// Get single user
app.get('/api/users/:id', userController.getUser);

// Update user
app.put('/api/users/:id', userController.updateUser);

// Update user role
app.put('/api/users/:id/role', userController.updateUserRole);

// Delete user
app.delete('/api/users/:id', userController.deleteUser);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    services: {
      products: 'active',
      users: 'active',
      mongodb: 'connected'
    },
    timestamp: new Date().toISOString()
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║            🚀 SMART CITY BACKEND API            ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  📡 API Server: http://localhost:${PORT}         ║
║  🗄️  MongoDB: Connected                          ║
║  🔥 Firebase: Authentication only                ║
║                                                  ║
╠══════════════════════════════════════════════════╣
║                 📋 ENDPOINTS                     ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  🔥 FIREBASE AUTH (Frontend)                     ║
║  • Login/Signup                                  ║
║                                                  ║
║  📦 PRODUCTS (MongoDB)                           ║
║  GET    /api/products                            ║
║  POST   /api/products                            ║
║  PUT    /api/products/:id                        ║
║  DELETE /api/products/:id                        ║
║                                                  ║
║  👥 USERS (MongoDB)                              ║
║  POST   /api/users/sync     - Sync Firebase user ║
║  GET    /api/users          - Get all users      ║
║  GET    /api/users/stats    - User statistics    ║
║  GET    /api/users/:id      - Get single user    ║
║  PUT    /api/users/:id      - Update user        ║
║  PUT    /api/users/:id/role - Update user role   ║
║  DELETE /api/users/:id      - Delete user        ║
║                                                  ║
╚══════════════════════════════════════════════════╝
  `);
});