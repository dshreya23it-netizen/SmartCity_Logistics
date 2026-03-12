const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Basic product info
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: String,
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  category: {
    type: String,
    enum: ['sensors', 'iot', 'trackers', 'cameras', 'network', 'other'],
    default: 'other'
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out-of-stock', 'discontinued'],
    default: 'active'
  },
  
  // Sensor-specific fields
  isSensor: {
    type: Boolean,
    default: false
  },
  sensorId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  sensorType: {
    type: String,
    enum: ['temperature', 'humidity', 'pressure', 'motion', 'light', 'air-quality', 'gps', 'noise', 'traffic', 'parking', 'other']
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
    zone: String
  },
  sensorData: {
    type: Object,
    default: {}
  },
  lastReading: Date,
  
  // Metadata
  manufacturer: String,
  model: String,
  firmwareVersion: String,
  installationDate: Date,
  
  // Admin
  createdBy: String,
  notes: String
}, {
  timestamps: true
});

// Indexes for faster queries
productSchema.index({ sensorId: 1 });
productSchema.index({ isSensor: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

module.exports = mongoose.model('Product', productSchema);