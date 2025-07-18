const AuthService = require('../utils/AuthService');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Unified Authentication Middleware
 * Replaces all scattered auth middleware with consistent approach
 */

/**
 * Basic authentication - verifies token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    const user = await AuthService.authenticateUser(req);
    
    if (!AuthService.isActive(user)) {
      return res.status(403).json(ApiResponse.authorizationError('Account is inactive'));
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json(ApiResponse.authError(error.message));
  }
};

/**
 * Admin-only access
 */
const requireAdmin = async (req, res, next) => {
  try {
    const user = await AuthService.authenticateUser(req);
    
    if (!AuthService.isActive(user)) {
      return res.status(403).json(ApiResponse.authorizationError('Account is inactive'));
    }
    
    if (!AuthService.isAdmin(user)) {
      return res.status(403).json(ApiResponse.authorizationError('Admin access required'));
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json(ApiResponse.authError(error.message));
  }
};

/**
 * Permission-based authentication
 * @param {string} permission - Required permission
 */
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      const user = await AuthService.authenticateUser(req);
      
      if (!AuthService.isActive(user)) {
        return res.status(403).json(ApiResponse.authorizationError('Account is inactive'));
      }
      
      if (!AuthService.hasPermission(user, permission)) {
        return res.status(403).json(ApiResponse.authorizationError(`Permission required: ${permission}`));
      }
      
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json(ApiResponse.authError(error.message));
    }
  };
};

/**
 * User or admin authentication - user can access own resources, admin can access all
 * @param {string} userIdParam - Parameter name for user ID (default: 'id')
 */
const requireUserOrAdmin = (userIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const user = await AuthService.authenticateUser(req);
      
      if (!AuthService.isActive(user)) {
        return res.status(403).json(ApiResponse.authorizationError('Account is inactive'));
      }
      
      const targetUserId = req.params[userIdParam];
      const isOwnResource = user.id.toString() === targetUserId;
      const isAdmin = AuthService.isAdmin(user);
      
      if (!isOwnResource && !isAdmin) {
        return res.status(403).json(ApiResponse.authorizationError('Access denied'));
      }
      
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json(ApiResponse.authError(error.message));
    }
  };
};

/**
 * Optional authentication - doesn't fail if no token, but attaches user if valid token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const user = await AuthService.authenticateUser(req);
    req.user = AuthService.isActive(user) ? user : null;
  } catch (error) {
    // Continue without user for optional auth
    req.user = null;
  }
  next();
};

/**
 * Finance manager authentication
 */
const requireFinanceManager = requirePermission('MANAGE_FINANCES');

/**
 * Service provider authentication
 */
const requireServiceProvider = requirePermission('CREATE_SERVICES');

/**
 * Event organizer authentication
 */
const requireEventOrganizer = requirePermission('CREATE_EVENTS');

// Export all middleware functions
module.exports = {
  authenticate,
  requireAdmin,
  requirePermission,
  requireUserOrAdmin,
  optionalAuth,
  requireFinanceManager,
  requireServiceProvider,
  requireEventOrganizer,
  
  // Backward compatibility aliases (will be deprecated)
  protect: authenticate,
  protectAdmin: requireAdmin,
  verifyToken: authenticate,
  verifyAdmin: requireAdmin,
  userMiddleware: authenticate,
  adminMiddleware: requireAdmin
}; 