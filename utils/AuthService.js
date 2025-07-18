const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const ApiResponse = require('./ApiResponse');

/**
 * Centralized Authentication Service
 * Handles all authentication operations consistently
 */
class AuthService {
  static JWT_SECRET = process.env.JWT_SECRET || 'mekarahasak';

  /**
   * Generate JWT token
   * @param {object} payload - Token payload
   * @param {string} expiresIn - Token expiration
   */
  static generateToken(payload, expiresIn = '1h') {
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token to verify
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Extract token from request
   * @param {object} req - Express request object
   */
  static extractToken(req) {
    // Priority: Bearer token > Cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      return req.headers.authorization.substring(7);
    }
    
    if (req.cookies && req.cookies.access_token) {
      return req.cookies.access_token;
    }
    
    return null;
  }

  /**
   * Authenticate user and attach to request
   * @param {object} req - Express request object
   */
  static async authenticateUser(req) {
    const token = this.extractToken(req);
    
    if (!token) {
      throw new Error('Authentication token required');
    }

    const decoded = this.verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      throw new Error('User not found');
    }

    // Standardized user object
    return {
      id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin || false,
      userType: user.userType || user.type || 'customer',
      isActive: user.isActive !== false
    };
  }

  /**
   * Check if user has specific permission
   * @param {object} user - User object
   * @param {string} permission - Permission to check
   */
  static hasPermission(user, permission) {
    const rolePermissions = {
      admin: [
        'VIEW_ADMIN_DASHBOARD',
        'MANAGE_USERS',
        'APPROVE_PROVIDERS',
        'MANAGE_FINANCES',
        'MANAGE_SERVICES',
        'VIEW_ALL_RESERVATIONS',
        'MANAGE_EVENTS'
      ],
      financeManager: [
        'MANAGE_FINANCES',
        'VIEW_FINANCIAL_REPORTS',
        'PROCESS_REFUNDS'
      ],
      serviceProvider: [
        'CREATE_SERVICES',
        'MANAGE_OWN_SERVICES',
        'VIEW_OWN_RESERVATIONS'
      ],
      eventOrganizer: [
        'CREATE_EVENTS',
        'MANAGE_OWN_EVENTS'
      ],
      customer: [
        'CREATE_RESERVATIONS',
        'VIEW_OWN_PROFILE',
        'MANAGE_OWN_BOOKINGS'
      ]
    };

    if (user.isAdmin) {
      return rolePermissions.admin.includes(permission);
    }

    const userRole = user.userType || 'customer';
    const permissions = rolePermissions[userRole] || rolePermissions.customer;
    
    return permissions.includes(permission);
  }

  /**
   * Check if user is admin
   * @param {object} user - User object
   */
  static isAdmin(user) {
    return user.isAdmin === true;
  }

  /**
   * Check if user is active
   * @param {object} user - User object
   */
  static isActive(user) {
    return user.isActive !== false;
  }
}

module.exports = AuthService; 