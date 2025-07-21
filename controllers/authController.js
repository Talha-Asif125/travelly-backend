const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
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

// Create email transporter
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// @desc    Register new user with email verification
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

  // Generate email verification token
  const emailVerificationToken = generateVerificationToken();
  const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create user data
  const userData = {
    name: sanitizedName,
    email: sanitizedEmail,
    mobile: mobile.trim(),
    country: country,
    type: type,
    password: hashedPassword,
    isAdmin: false,
    pic: pic || "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg",
    isActive: true,
    isEmailVerified: false,
    emailVerificationToken,
    emailVerificationExpires,
    lastLoginAt: null
  };

  // Create new user
  const newUser = new User(userData);
  await newUser.save();

  // Send verification email
  try {
    const transporter = createEmailTransporter();
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${emailVerificationToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'noreply@travely.com',
      to: sanitizedEmail,
      subject: "Welcome to Travely - Verify Your Email",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .logo { text-align: center; color: #41A4FF; font-size: 28px; font-weight: bold; margin-bottom: 20px; }
            .content { line-height: 1.6; color: #333; }
            .button { display: inline-block; background: #41A4FF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🧳 Travel Buddy</div>
            <div class="content">
              <h2>Welcome to Travel Buddy, ${sanitizedName}! 🎉</h2>
              <p>Thank you for joining our travel community! To complete your registration and start exploring amazing travel experiences, please verify your email address.</p>
              
              <p style="text-align: center;">
                <a href="${verificationLink}" class="button">Verify My Email</a>
              </p>
              
              <p><strong>Or copy and paste this link in your browser:</strong></p>
              <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px;">${verificationLink}</p>
              
              <p><strong>This verification link will expire in 24 hours.</strong></p>
              
              <p>If you didn't create this account, please ignore this email.</p>
              
              <p>Happy travels! ✈️<br>The Travel Buddy Team</p>
            </div>
            
            <div class="footer">
              <p>This email was sent from Travel Buddy. If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`Verification email sent to ${sanitizedEmail}`);
  } catch (emailError) {
    console.error('Error sending verification email:', emailError);
    // Don't fail registration if email fails, but log the error
  }

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
          mobile: newUser.mobile,
          isEmailVerified: newUser.isEmailVerified
        },
        message: 'Registration successful! Please check your email to verify your account.',
        emailSent: true
      },
      'Registration successful - Please verify your email',
      201
    )
  );
});

// @desc    Verify email
// @route   GET /api/verify-email/:token
// @access  Public
const verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json(ApiResponse.error('Verification token is required'));
  }

  // Find user with this verification token
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json(ApiResponse.error('Invalid or expired verification token'));
  }

  // Update user verification status
  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();

  res.status(200).json(
    ApiResponse.success(
      {
        verified: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified
        }
      },
      'Email verified successfully! You can now login to your account.'
    )
  );
});

// @desc    Resend verification email
// @route   POST /api/resend-verification
// @access  Public
const resendVerificationEmail = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json(ApiResponse.error('Email is required'));
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(404).json(ApiResponse.error('User not found'));
  }

  if (user.isEmailVerified) {
    return res.status(400).json(ApiResponse.error('Email is already verified'));
  }

  // Generate new verification token
  const emailVerificationToken = generateVerificationToken();
  const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  user.emailVerificationToken = emailVerificationToken;
  user.emailVerificationExpires = emailVerificationExpires;
  await user.save();

  // Send verification email
  try {
    const transporter = createEmailTransporter();
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${emailVerificationToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'noreply@travely.com',
      to: user.email,
      subject: "Travel Buddy - Email Verification",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .logo { text-align: center; color: #41A4FF; font-size: 28px; font-weight: bold; margin-bottom: 20px; }
            .content { line-height: 1.6; color: #333; }
            .button { display: inline-block; background: #41A4FF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🧳 Travel Buddy</div>
            <div class="content">
              <h2>Email Verification</h2>
              <p>Hello ${user.name},</p>
              <p>Please click the button below to verify your email address:</p>
              
              <p style="text-align: center;">
                <a href="${verificationLink}" class="button">Verify My Email</a>
              </p>
              
              <p>This verification link will expire in 24 hours.</p>
              <p>If you didn't request this, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    res.status(200).json(
      ApiResponse.success(
        { emailSent: true },
        'Verification email sent successfully'
      )
    );
  } catch (emailError) {
    console.error('Error sending verification email:', emailError);
    res.status(500).json(ApiResponse.error('Failed to send verification email'));
  }
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

  // Check if email is verified
  if (!user.isEmailVerified) {
    return res.status(403).json(ApiResponse.error('Please verify your email before logging in. Check your inbox for verification link.'));
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
    '1h'
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
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified
  };

  // Set secure cookie
  res.cookie("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000 // 1 hour
  });

  res.status(200).json(
    ApiResponse.success(
      {
        user: userDetails,
        token,
        expiresIn: '1h'
      },
      'Login successful'
    )
  );
});

// @desc    Logout user
// @route   POST /api/logout
// @access  Public
const logoutUser = catchAsync(async (req, res, next) => {
  res.clearCookie("access_token");
  res.status(200).json(ApiResponse.success(null, 'Logged out successfully'));
});

// @desc    Forgot password request
// @route   POST /api/forgot-password
// @access  Public
const forgotPasswordRequest = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json(ApiResponse.error('Email is required'));
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(404).json(ApiResponse.error('No account found with this email address'));
  }

  // Generate reset token
  const resetToken = generateVerificationToken();
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  user.passwordResetToken = resetToken;
  user.passwordResetExpires = resetExpires;
  await user.save();

  // Create reset link
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  // Send reset email
  try {
    const transporter = createEmailTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'noreply@travely.com',
      to: user.email,
      subject: "Travel Buddy - Password Reset Request",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .logo { text-align: center; color: #41A4FF; font-size: 28px; font-weight: bold; margin-bottom: 20px; }
            .content { line-height: 1.6; color: #333; }
            .button { display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🧳 Travel Buddy</div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello ${user.name},</p>
              <p>We received a request to reset your password. If you made this request, click the button below to reset your password:</p>
              
              <p style="text-align: center;">
                <a href="${resetLink}" class="button">Reset My Password</a>
              </p>
              
              <p><strong>Or copy and paste this link in your browser:</strong></p>
              <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px;">${resetLink}</p>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul>
                  <li>This reset link will expire in 1 hour</li>
                  <li>For security, you can only use this link once</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                </ul>
              </div>
              
              <p>If you continue to have problems, please contact our support team.</p>
              
              <p>Best regards,<br>The Travel Buddy Team</p>
            </div>
            
            <div class="footer">
              <p>This email was sent from Travel Buddy. If you didn't request this password reset, your account is still secure.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    res.status(200).json(
      ApiResponse.success(
        { 
          resetTokenSent: true,
          email: user.email 
        },
        'Password reset link sent to your email. Please check your inbox.'
      )
    );
  } catch (emailError) {
    console.error('Error sending reset email:', emailError);
    
    // Clear the reset token if email fails
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();
    
    res.status(500).json(ApiResponse.error('Failed to send password reset email. Please try again.'));
  }
});

// @desc    Reset password
// @route   POST /api/reset-password
// @access  Public
const resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json(ApiResponse.error('Reset token and new password are required'));
  }

  // Validate password strength
  const passwordValidation = SecurityValidator.validatePassword(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json(ApiResponse.error(passwordValidation.message));
  }

  // Find user with valid reset token
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json(ApiResponse.error('Invalid or expired reset token. Please request a new password reset.'));
  }

  // Hash new password
  const hashedPassword = await SecurityValidator.hashPassword(password);

  // Update password and clear reset fields
  user.password = hashedPassword;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  res.status(200).json(
    ApiResponse.success(
      null,
      'Password reset successfully! You can now login with your new password.'
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

  const user = await User.findOne({ email: email.toLowerCase() });
  
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
  verifyEmail,
  resendVerificationEmail,
  loginUser,
  logoutUser,
  forgotPasswordRequest,
  resetPassword,
  checkEmailExists,
  checkMobileExists,
  getCurrentUser,
  
  // Backward compatibility (deprecated)
  resetPasswordRequest: forgotPasswordRequest,
  resetpasswordrequest: forgotPasswordRequest,
  resetpassword: resetPassword,
};
