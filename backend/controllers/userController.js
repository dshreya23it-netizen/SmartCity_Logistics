// backend/controllers/userController.js
const User = require('../models/User');

// Sync Firebase user to MongoDB
exports.syncFirebaseUser = async (req, res) => {
  try {
    const { firebaseUid, email, displayName, photoURL, phoneNumber } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ firebaseUid });
    
    if (user) {
      // Update existing user
      user.email = email || user.email;
      user.displayName = displayName || user.displayName;
      user.photoURL = photoURL || user.photoURL;
      user.phoneNumber = phoneNumber || user.phoneNumber;
      user.lastLogin = new Date();
      user.loginCount += 1;
      
      await user.save();
      return res.json({ 
        success: true, 
        message: 'User updated in MongoDB',
        data: user 
      });
    }
    
    // Create new user in MongoDB
    user = new User({
      firebaseUid,
      email,
      displayName,
      photoURL,
      phoneNumber,
      lastLogin: new Date(),
      loginCount: 1,
      role: email === 'admin@example.com' ? 'admin' : 'user' // Default role logic
    });
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'User synced to MongoDB',
      data: user
    });
    
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    
    const query = {};
    
    // Apply filters
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) query.role = role;
    if (status) query.status = status;
    
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-firebaseUid -auditLog'); // Exclude sensitive fields
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single user
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-firebaseUid -auditLog');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update user (admin only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Don't allow updating firebaseUid or email
    delete updateData.firebaseUid;
    delete updateData.email;
    
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-firebaseUid -auditLog');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Add to audit log
    user.auditLog.push({
      action: 'UPDATE_PROFILE',
      details: updateData
    });
    await user.save();
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update user role (admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['user', 'admin', 'manager', 'viewer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-firebaseUid -auditLog');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Add to audit log
    user.auditLog.push({
      action: 'ROLE_CHANGE',
      details: { newRole: role }
    });
    await user.save();
    
    res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: user
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get user stats
exports.getUserStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      adminCount,
      todayLogins,
      userGrowth
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({
        lastLogin: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }),
      User.aggregate([
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } },
        { $limit: 30 }
      ])
    ]);
    
    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        adminCount,
        todayLogins,
        userGrowth
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};