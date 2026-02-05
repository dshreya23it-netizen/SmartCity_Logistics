// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 1. Define Environment Variables
const mongoURI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000; 

const app = express();
app.use(cors());
app.use(express.json());

// 2. MongoDB Connection
mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB Atlas Connected'))
  .catch(err => {
    console.error('❌ MongoDB Error:', err.message);
    if (!mongoURI) console.error("Missing MONGO_URI in Environment Variables!");
  });

// Import models
const Product = require('./models/Product');
const User = require('./models/User');

// Import controllers
const userController = require('./controllers/userController');

// Root Route
app.get('/', (req, res) => {
  res.send('Smart City Logistics API is running...');
});

// ============ PRODUCT ROUTES ============
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
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
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

// ============ USER ROUTES ============
app.post('/api/users/sync', userController.syncFirebaseUser);
app.get('/api/users', userController.getAllUsers);
app.get('/api/users/stats', userController.getUserStats);
app.get('/api/users/:id', userController.getUser);
app.put('/api/users/:id', userController.updateUser);
app.put('/api/users/:id/role', userController.updateUserRole);
app.delete('/api/users/:id', userController.deleteUser);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// 3. Start Server with 0.0.0.0 for Render
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});