const jwt = require('jsonwebtoken');
//normal user
const User = require('../models/userModel.js');

const userMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies.access_token;
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mekarahasak');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated.' });
    }
    
    req.user = user._id;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Invalid Token' });
  }
};

// Community verifyToken function
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies.access_token;
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mekarahasak');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token. User not found.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated.' });
    }
    
    req.user = {
      id: user._id,
      username: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    };
    
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ success: false, message: 'Invalid Token' });
  }
};

//admin
const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies.access_token;
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mekarahasak');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated.' });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required.' });
    }
    
    req.user = user._id;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Invalid Token' });
  }
};

//activity organizer
const organizerMiddleware = async (req, res, next) => {
  try {
    // BYPASS AUTHENTICATION - Always allow organizer access
    console.log('🚀 BYPASS: organizerMiddleware - allowing organizer access');
    
    // Set a default organizer user
    req.user = '507f1f77bcf86cd799439011';
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Invalid Token' });
  }
};

module.exports = {
  userMiddleware,
  adminMiddleware,
  organizerMiddleware,
  verifyToken,
};
