/**
 * Standardized API Response Utility
 * Ensures consistent response format across all endpoints
 */
class ApiResponse {
  /**
   * Success response
   * @param {*} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   */
  static success(data = null, message = 'Success', statusCode = 200) {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      statusCode
    };
  }

  /**
   * Error response
   * @param {string} message - Error message
   * @param {*} errors - Detailed errors
   * @param {number} statusCode - HTTP status code
   */
  static error(message = 'An error occurred', errors = null, statusCode = 400) {
    return {
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
      statusCode
    };
  }

  /**
   * Paginated response
   * @param {*} data - Response data
   * @param {object} pagination - Pagination info
   * @param {string} message - Success message
   */
  static paginated(data, pagination, message = 'Success') {
    return {
      success: true,
      message,
      data,
      pagination: {
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(pagination.total / pagination.limit),
        hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
        hasPrev: pagination.page > 1
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validation error response
   * @param {array} validationErrors - Array of validation errors
   */
  static validationError(validationErrors) {
    return {
      success: false,
      message: 'Validation failed',
      errors: validationErrors,
      timestamp: new Date().toISOString(),
      statusCode: 422
    };
  }

  /**
   * Authentication error response
   */
  static authError(message = 'Authentication required') {
    return {
      success: false,
      message,
      timestamp: new Date().toISOString(),
      statusCode: 401
    };
  }

  /**
   * Authorization error response
   */
  static authorizationError(message = 'Access denied') {
    return {
      success: false,
      message,
      timestamp: new Date().toISOString(),
      statusCode: 403
    };
  }

  /**
   * Not found error response
   */
  static notFound(message = 'Resource not found') {
    return {
      success: false,
      message,
      timestamp: new Date().toISOString(),
      statusCode: 404
    };
  }
}

module.exports = ApiResponse; 