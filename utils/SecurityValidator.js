const validator = require('validator');
const bcrypt = require('bcryptjs');
const ApiResponse = require('./ApiResponse');

/**
 * Security Validator Utility
 * Provides comprehensive input validation and security checks
 */
class SecurityValidator {
  
  /**
   * Validate email format and security
   * @param {string} email - Email to validate
   * @returns {object} - Validation result
   */
  static validateEmail(email) {
    if (!email) {
      return { isValid: false, message: 'Email is required' };
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }

    // Check email length (reasonable limits)
    if (email.length > 254) {
      return { isValid: false, message: 'Email address is too long' };
    }

    // Only check for extremely suspicious patterns (security threats)
    const maliciousPatterns = [
      /<script|javascript:|on\w+=/i, // XSS attempts
      /\.\./,  // Directory traversal
    ];

    if (maliciousPatterns.some(pattern => pattern.test(email))) {
      return { isValid: false, message: 'Invalid email format detected' };
    }

    return { isValid: true, message: 'Valid email' };
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {object} - Validation result
   */
  static validatePassword(password) {
    if (!password) {
      return { isValid: false, message: 'Password is required' };
    }

    // Minimum length check
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }

    // Maximum length check (prevent DoS)
    if (password.length > 128) {
      return { isValid: false, message: 'Password must not exceed 128 characters' };
    }

    // Check for required character types
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasLowercase) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (!hasUppercase) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (!hasNumbers) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }

    if (!hasSpecialChar) {
      return { isValid: false, message: 'Password must contain at least one special character' };
    }

    // Check for common weak passwords
    const weakPasswords = [
      'password', 'password123', '123456789', 'qwerty123',
      'admin123', 'welcome123', 'letmein123', 'changeme123'
    ];

    if (weakPasswords.some(weak => password.toLowerCase().includes(weak))) {
      return { isValid: false, message: 'Password is too common. Please choose a stronger password' };
    }

    // Check for repeated patterns
    if (/(.{2,})\1{2,}/.test(password)) {
      return { isValid: false, message: 'Password contains too many repeated patterns' };
    }

    return { isValid: true, message: 'Strong password' };
  }

  /**
   * Validate mobile number (Pakistani format)
   * @param {string} mobile - Mobile number to validate
   * @returns {object} - Validation result
   */
  static validateMobile(mobile) {
    if (!mobile) {
      return { isValid: false, message: 'Mobile number is required' };
    }

    // Remove all non-digit characters
    const cleanMobile = mobile.replace(/\D/g, '');

    // More flexible Pakistani mobile validation
    // Accept 10 or 11 digits starting with 03 or 3
    if (cleanMobile.length === 11) {
      // 11-digit format: must start with 03
      if (!cleanMobile.startsWith('03')) {
        return { isValid: false, message: 'Pakistani mobile number must start with 03 (11 digits format)' };
      }
    } else if (cleanMobile.length === 10) {
      // 10-digit format: must start with 3
      if (!cleanMobile.startsWith('3')) {
        return { isValid: false, message: 'Pakistani mobile number must start with 3 (10 digits format)' };
      }
    } else {
      return { isValid: false, message: `Mobile number must be 10 or 11 digits. Received: ${cleanMobile.length} digits` };
    }

    return { isValid: true, message: 'Valid mobile number' };
  }

  /**
   * Validate name
   * @param {string} name - Name to validate
   * @returns {object} - Validation result
   */
  static validateName(name) {
    if (!name) {
      return { isValid: false, message: 'Name is required' };
    }

    if (name.length < 2) {
      return { isValid: false, message: 'Name must be at least 2 characters long' };
    }

    if (name.length > 50) {
      return { isValid: false, message: 'Name must not exceed 50 characters' };
    }

    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    if (!/^[a-zA-Z\s\-']+$/.test(name)) {
      return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }

    return { isValid: true, message: 'Valid name' };
  }

  /**
   * Sanitize input to prevent XSS
   * @param {string} input - Input to sanitize
   * @returns {string} - Sanitized input
   */
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return validator.escape(input);
  }

  /**
   * Validate user type
   * @param {string} userType - User type to validate
   * @returns {object} - Validation result
   */
  static validateUserType(userType) {
    const validTypes = [
      'traveler', 'hotelOwner', 'vehicleOwner', 'restaurantOwner',
      'tourGuide', 'eventOrganizer', 'provider', 'financeManager'
    ];

    if (!userType) {
      return { isValid: false, message: 'User type is required' };
    }

    if (!validTypes.includes(userType)) {
      return { isValid: false, message: 'Invalid user type' };
    }

    return { isValid: true, message: 'Valid user type' };
  }

  /**
   * Validate country code
   * @param {string} countryCode - Country code to validate
   * @returns {object} - Validation result
   */
  static validateCountryCode(countryCode) {
    if (!countryCode) {
      return { isValid: false, message: 'Country is required' };
    }

    // List of common country codes - more reliable than validator package
    const validCountryCodes = [
      'AF', 'AL', 'DZ', 'AD', 'AO', 'AG', 'AR', 'AM', 'AU', 'AT', 'AZ', 'BS', 'BH', 'BD', 'BB', 'BY', 'BE', 'BZ', 'BJ', 'BT',
      'BO', 'BA', 'BW', 'BR', 'BN', 'BG', 'BF', 'BI', 'CV', 'KH', 'CM', 'CA', 'CF', 'TD', 'CL', 'CN', 'CO', 'KM', 'CG', 'CR',
      'CI', 'HR', 'CU', 'CY', 'CZ', 'CD', 'DK', 'DJ', 'DM', 'DO', 'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'ET', 'FJ', 'FI', 'FR',
      'GA', 'GM', 'GE', 'DE', 'GH', 'GR', 'GD', 'GT', 'GN', 'GW', 'GY', 'HT', 'HN', 'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE',
      'IL', 'IT', 'JM', 'JP', 'JO', 'KZ', 'KE', 'KI', 'KP', 'KR', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI', 'LT',
      'LU', 'MK', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MR', 'MU', 'MX', 'FM', 'MD', 'MC', 'MN', 'ME', 'MA', 'MZ', 'MM',
      'NA', 'NR', 'NP', 'NL', 'NZ', 'NI', 'NE', 'NG', 'NO', 'OM', 'PK', 'PW', 'PS', 'PA', 'PG', 'PY', 'PE', 'PH', 'PL', 'PT',
      'QA', 'RO', 'RU', 'RW', 'KN', 'LC', 'VC', 'WS', 'SM', 'ST', 'SA', 'SN', 'RS', 'SC', 'SL', 'SG', 'SK', 'SI', 'SB', 'SO',
      'ZA', 'SS', 'ES', 'LK', 'SD', 'SR', 'SZ', 'SE', 'CH', 'SY', 'TJ', 'TZ', 'TH', 'TL', 'TG', 'TO', 'TT', 'TN', 'TR', 'TM',
      'TV', 'UG', 'UA', 'AE', 'GB', 'US', 'UY', 'UZ', 'VU', 'VE', 'VN', 'YE', 'ZM', 'ZW'
    ];

    if (!validCountryCodes.includes(countryCode.toUpperCase())) {
      return { isValid: false, message: `Invalid country code: ${countryCode}` };
    }

    return { isValid: true, message: 'Valid country code' };
  }

  /**
   * Check if request is suspicious
   * @param {object} req - Express request object
   * @returns {boolean} - Whether request is suspicious
   */
  static isSuspiciousRequest(req) {
    const suspiciousIndicators = [
      // Check for suspicious user agents
      /bot|crawler|spider|scraper/i.test(req.get('User-Agent') || ''),
      
      // Check for suspicious headers
      req.get('X-Forwarded-For') && req.get('X-Forwarded-For').split(',').length > 5,
      
      // Check for rapid requests (this would need session/IP tracking)
      false // Placeholder for more sophisticated detection
    ];

    return suspiciousIndicators.some(indicator => indicator);
  }

  /**
   * Generate secure password hash
   * @param {string} password - Password to hash
   * @returns {Promise<string>} - Hashed password
   */
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  /**
   * Verify password against hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} - Whether password matches
   */
  static async verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  /**
   * Validate complete registration data
   * @param {object} data - Registration data
   * @returns {object} - Validation result
   */
  static validateRegistrationData(data) {
    const errors = {};

    // Validate name
    const nameValidation = this.validateName(data.name);
    if (!nameValidation.isValid) {
      errors.name = nameValidation.message;
    }

    // Validate email
    const emailValidation = this.validateEmail(data.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.message;
    }

    // Validate mobile
    const mobileValidation = this.validateMobile(data.mobile);
    if (!mobileValidation.isValid) {
      errors.mobile = mobileValidation.message;
    }

    // Validate password
    const passwordValidation = this.validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message;
    }

    // Validate country
    const countryValidation = this.validateCountryCode(data.country);
    if (!countryValidation.isValid) {
      errors.country = countryValidation.message;
    }

    // Validate user type
    const userTypeValidation = this.validateUserType(data.type);
    if (!userTypeValidation.isValid) {
      errors.type = userTypeValidation.message;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

module.exports = SecurityValidator; 