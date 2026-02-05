const Product = require('../models/Product');

// GET all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE new product (can be sensor)
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// NEW: Get only sensor products
exports.getSensorProducts = async (req, res) => {
  try {
    const sensors = await Product.find({ 
      $or: [
        { isSensorDevice: true },
        { sensorId: { $exists: true } },
        { category: 'sensors' }
      ]
    });
    res.json({ success: true, count: sensors.length, data: sensors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// NEW: Update sensor data
exports.updateSensorData = async (req, res) => {
  try {
    const { sensorId } = req.params;
    const { data } = req.body;
    
    const product = await Product.findOneAndUpdate(
      { sensorId },
      { 
        $set: { 
          'sensorData': data,
          'lastReading': new Date()
        }
      },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sensor product not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Sensor data updated',
      data: product 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// NEW: Add sensor to existing product
exports.addSensorToProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const sensorData = req.body;
    
    const product = await Product.findByIdAndUpdate(
      productId,
      { 
        $set: {
          ...sensorData,
          isSensorDevice: true,
          lastReading: new Date()
        }
      },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Sensor added to product',
      data: product 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};