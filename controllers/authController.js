const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createError } = require("../middleware/error");
const nodemailer = require("nodemailer");
const AuthService = require("../utils/AuthService");
const ApiResponse = require("../utils/ApiResponse");
const SecurityValidator = require("../utils/SecurityValidator");
const { catchAsync, AppError } = require("../middleware/errorHandler");

// Use the same secret as authMiddleware.js for consistency
const JWT_SECRET = process.env.JWT_SECRET || 'mekarahasak';

const generateToken = (payload) => {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
  return token;
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error("Invalid token");
  }
};

// @desc    Register new user
// @route   POST /api/register
// @access  Public
const registerUser = catchAsync(async (req, res, next) => {
  const { email, password, mobile, name, country = "PK", type = "traveler", pic, ...extraData } = req.body;

  // Validate all required fields
  if (!email || !password || !mobile || !name) {
    return res.status(400).json(ApiResponse.error('All fields (name, email, mobile, password) are required'));
  }

  // Comprehensive validation using SecurityValidator
  const emailValidation = SecurityValidator.validateEmail(email);
  if (!emailValidation.isValid) {
    return res.status(400).json(ApiResponse.error(emailValidation.message));
  }

  const passwordValidation = SecurityValidator.validatePassword(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json(ApiResponse.error(passwordValidation.message));
  }

  const mobileValidation = SecurityValidator.validateMobile(mobile);
  if (!mobileValidation.isValid) {
    return res.status(400).json(ApiResponse.error(mobileValidation.message));
  }

  const nameValidation = SecurityValidator.validateName(name);
  if (!nameValidation.isValid) {
    return res.status(400).json(ApiResponse.error(nameValidation.message));
  }

  const userTypeValidation = SecurityValidator.validateUserType(type);
  if (!userTypeValidation.isValid) {
    return res.status(400).json(ApiResponse.error(userTypeValidation.message));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ 
    $or: [
      { email: email.toLowerCase() },
      { mobile: mobile }
    ]
  });

  if (existingUser) {
    if (existingUser.email === email.toLowerCase()) {
      return res.status(409).json(ApiResponse.error('Email already exists'));
    }
    if (existingUser.mobile === mobile) {
      return res.status(409).json(ApiResponse.error('Mobile number already exists'));
    }
  }

  // Sanitize inputs
  const sanitizedName = SecurityValidator.sanitizeInput(name);
  const sanitizedEmail = email.toLowerCase().trim();

  // Hash password
  const hashedPassword = await SecurityValidator.hashPassword(password);

  // Create user data
  const userData = {
    name: sanitizedName,
    email: sanitizedEmail,
    mobile: mobile.trim(),
    country: country,
    type: type,
    password: hashedPassword,
    isAdmin: false, // Never auto-assign admin privileges
    pic: pic || "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg",
    isActive: true,
    lastLoginAt: null
  };

  // Create new user
  const newUser = new User(userData);
  await newUser.save();

  // Generate token
  const token = AuthService.generateToken(
    { 
      id: newUser._id, 
      isAdmin: newUser.isAdmin,
      userType: newUser.type,
      email: newUser.email
    },
    '24h'
  );

  // Update login activity
  newUser.lastLoginAt = new Date();
  await newUser.save();

  res.status(201).json(
    ApiResponse.success(
      {
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          type: newUser.type,
          isAdmin: newUser.isAdmin,
          country: newUser.country,
          mobile: newUser.mobile
        },
        token,
        expiresIn: '24h'
      },
      'Registration successful',
      201
    )
  );
});

// @desc    Login user
// @route   POST /api/login
// @access  Public
const loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json(ApiResponse.error('Email and password are required'));
  }

  // Validate email format
  const emailValidation = SecurityValidator.validateEmail(email);
  if (!emailValidation.isValid) {
    return res.status(400).json(ApiResponse.error('Please enter a valid email address'));
  }

  // Find user by email (case-insensitive)
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  
  if (!user) {
    return res.status(401).json(ApiResponse.error('Invalid email or password'));
  }

  // Check if account is active
  if (!user.isActive) {
    return res.status(403).json(ApiResponse.error('Account is deactivated. Please contact support.'));
  }

  // Verify password
  const isPasswordValid = await SecurityValidator.verifyPassword(password, user.password);
  
  if (!isPasswordValid) {
    return res.status(401).json(ApiResponse.error('Invalid email or password'));
  }

  // Update login activity
  user.lastLoginAt = new Date();
  await user.save();

  // Generate token
  const token = AuthService.generateToken(
    { 
      id: user._id, 
      isAdmin: user.isAdmin,
      userType: user.type,
      email: user.email
    },
    '24h'
  );

  // Prepare user response (exclude sensitive fields)
  const userDetails = {
    _id: user._id,
    name: user.name,
    email: user.email,
    type: user.type,
    isAdmin: user.isAdmin,
    country: user.country,
    mobile: user.mobile,
    isActive: user.isActive
  };

  // Set secure cookie
  res.cookie("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  res.status(200).json(
    ApiResponse.success(
      {
        user: userDetails,
        token,
        expiresIn: '24h'
      },
      'Login successful'
    )
  );
});

// @desc    Logout user
// @route   POST /api/logout
// @access  Private
const logoutUser = (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  
  if (req.session) {
    req.session.destroy();
  }
  
  res.status(200).json(ApiResponse.success(null, 'Logged out successfully'));
};

// @desc    Reset password request
// @route   POST /api/reset-password-request
// @access  Public
const resetPasswordRequest = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json(ApiResponse.error('Email is required'));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json(ApiResponse.notFound('User not found'));
  }

  // Generate reset token (shorter expiration for security)
  const resetToken = AuthService.generateToken({ userId: user._id }, '1h');
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  // Create email transporter
  const transporter = nodemailer.createTransporter({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      ciphers: "SSLv3",
    },
  });

  // Send reset email
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset - Travely",
    html: `
      <h2>Password Reset Request</h2>
      <p>Hello ${user.firstName || 'User'},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetLink}" style="color: #007bff;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });

  res.status(200).json(
    ApiResponse.success(
      { resetTokenSent: true },
      'Password reset email sent successfully'
    )
  );
});

// @desc    Reset password
// @route   POST /api/reset-password
// @access  Public
const resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json(ApiResponse.error('Token and new password are required'));
  }

  if (password.length < 6) {
    return res.status(400).json(ApiResponse.error('Password must be at least 6 characters long'));
  }

  // Verify reset token
  let decoded;
  try {
    decoded = AuthService.verifyToken(token);
  } catch (error) {
    return res.status(400).json(ApiResponse.error('Invalid or expired reset token'));
  }

  // Find user
  const user = await User.findById(decoded.userId);
  if (!user) {
    return res.status(404).json(ApiResponse.notFound('User not found'));
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Update password
  user.password = hashedPassword;
  await user.save();

  res.status(200).json(
    ApiResponse.success(
      null,
      'Password reset successfully'
    )
  );
});

// @desc    Check if email exists
// @route   GET /api/check-email
// @access  Public
const checkEmailExists = catchAsync(async (req, res, next) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json(ApiResponse.error('Email parameter is required'));
  }

  const user = await User.findOne({ email });
  
  if (user) {
    return res.status(409).json(ApiResponse.error('Email already exists', null, 409));
  }
  
  res.status(200).json(ApiResponse.success(null, 'Email is available'));
});

// @desc    Check if mobile exists
// @route   GET /api/check-mobile
// @access  Public
const checkMobileExists = catchAsync(async (req, res, next) => {
  const { mobile } = req.query;

  if (!mobile) {
    return res.status(400).json(ApiResponse.error('Mobile parameter is required'));
  }

  const user = await User.findOne({ mobile });
  
  if (user) {
    return res.status(409).json(ApiResponse.error('Mobile number already exists', null, 409));
  }
  
  res.status(200).json(ApiResponse.success(null, 'Mobile number is available'));
});

// @desc    Get current user profile
// @route   GET /api/me
// @access  Private
const getCurrentUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password');
  
  if (!user) {
    return res.status(404).json(ApiResponse.notFound('User not found'));
  }

  res.status(200).json(
    ApiResponse.success(
      user,
      'User profile retrieved successfully'
    )
  );
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  resetPasswordRequest,
  resetPassword,
  checkEmailExists,
  checkMobileExists,
  getCurrentUser,
  
  // Backward compatibility (deprecated)
  resetpasswordrequest: resetPasswordRequest,
  resetpassword: resetPassword,
};
