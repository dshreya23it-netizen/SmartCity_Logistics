// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Link to Firebase UID
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },
  
  // User profile
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  displayName: String,
  photoURL: String,
  phoneNumber: String,
  
  // User role and permissions
  role: {
    type: String,
    enum: ['user', 'admin', 'manager', 'viewer'],
    default: 'user'
  },
  
  // User status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'active'
  },
  
  // Additional user info
  department: String,
  position: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  
  // Stats
  lastLogin: Date,
  loginCount: {
    type: Number,
    default: 0
  },
  
  // Preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: String,
  
  // Audit trail
  auditLog: [{
    action: String,
    timestamp: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String,
    details: Object
  }]
}, {
  timestamps: true
});

// Update updatedAt on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);