const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
  sensorId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  sensorType: {
    type: String,
    required: true,
    enum: ['temperature', 'humidity', 'pressure', 'motion', 'light', 'traffic', 'parking', 'air-quality', 'other']
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    address: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'offline'],
    default: 'active'
  },
  data: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Sensor', sensorSchema);