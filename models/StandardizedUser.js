const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { 
  BaseModel, 
  AddressSchema, 
  ContactSchema, 
  UserTypeEnum, 
  ServiceTypeEnum 
} = require('./BaseModel');

/**
 * Standardized User Model
 * Consistent field naming and comprehensive user management
 */

const UserSchema = BaseModel.createSchema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  
  // Authentication
  emailAddress: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email address'],
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include in queries by default
  },
  
  // Contact Information
  contact: {
    type: ContactSchema,
    required: true
  },
  
  // Address Information  
  address: {
    type: AddressSchema,
    required: true
  },
  
  // Profile
  profileImage: {
    type: String,
    default: 'https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg'
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v < new Date();
      },
      message: 'Date of birth must be in the past'
    }
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    lowercase: true
  },
  
  // User Classification
  userType: {
    type: String,
    required: true,
    enum: Object.values(UserTypeEnum),
    default: UserTypeEnum.CUSTOMER,
    index: true
  },
  
  // Administrative Fields
  isAdmin: {
    type: Boolean,
    default: false,
    index: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  
  // Password Reset
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  
  // Service Provider Specific Fields
  serviceProviderDetails: {
    approvedServices: [{
      type: String,
      enum: Object.values(ServiceTypeEnum)
    }],
    businessName: {
      type: String,
      trim: true,
      maxlength: [100, 'Business name cannot exceed 100 characters']
    },
    businessRegistrationNumber: {
      type: String,
      trim: true
    },
    businessAddress: {
      type: AddressSchema
    },
    businessContact: {
      type: ContactSchema
    },
    taxId: {
      type: String,
      trim: true
    },
    bankDetails: {
      accountNumber: String,
      bankName: String,
      branchCode: String,
      accountHolderName: String
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending'
    },
    approvalDate: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectionReason: String
  },
  
  // User Activity
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  loginCount: {
    type: Number,
    default: 0
  },
  accountStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'banned'],
    default: 'active',
    index: true
  },
  
  // Preferences
  preferences: {
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'si', 'ta']
    },
    currency: {
      type: String,
      default: 'LKR',
      enum: ['LKR', 'USD', 'EUR']
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    marketing: {
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false }
    }
  },
  
  // Legacy fields for backward compatibility (deprecated)
  name: {
    type: String,
    get: function() {
      return `${this.firstName} ${this.lastName}`;
    }
  },
  email: {
    type: String,
    get: function() {
      return this.emailAddress;
    }
  },
  mobile: {
    type: String,
    get: function() {
      return this.contact?.phoneNumber;
    }
  },
  pic: {
    type: String,
    get: function() {
      return this.profileImage;
    }
  },
  img: {
    type: String,
    get: function() {
      return this.profileImage;
    }
  },
  type: {
    type: String,
    get: function() {
      return this.userType;
    }
  }
});

// Indexes for performance
UserSchema.index({ emailAddress: 1 }, { unique: true });
UserSchema.index({ userType: 1, accountStatus: 1 });
UserSchema.index({ 'serviceProviderDetails.approvalStatus': 1 });
UserSchema.index({ lastLoginAt: -1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
UserSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Instance Methods
UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

UserSchema.methods.generateEmailVerificationToken = function() {
  const crypto = require('crypto');
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

UserSchema.methods.updateLoginActivity = function() {
  this.lastLoginAt = new Date();
  this.loginCount += 1;
  return this.save();
};

UserSchema.methods.isServiceProvider = function() {
  return this.userType === UserTypeEnum.SERVICE_PROVIDER;
};

UserSchema.methods.hasApprovedService = function(serviceType) {
  return this.serviceProviderDetails?.approvedServices?.includes(serviceType) || false;
};

// Static Methods
UserSchema.statics.findByEmail = function(email) {
  return this.findOne({ emailAddress: email.toLowerCase() });
};

UserSchema.statics.findServiceProviders = function(serviceType = null) {
  const filter = { 
    userType: UserTypeEnum.SERVICE_PROVIDER,
    'serviceProviderDetails.approvalStatus': 'approved'
  };
  
  if (serviceType) {
    filter['serviceProviderDetails.approvedServices'] = serviceType;
  }
  
  return this.find(filter);
};

UserSchema.statics.getPendingApprovals = function() {
  return this.find({
    userType: UserTypeEnum.SERVICE_PROVIDER,
    'serviceProviderDetails.approvalStatus': 'pending'
  });
};

// Pre-save middleware
UserSchema.pre('save', async function(next) {
  // Hash password if it was modified
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Ensure serviceProviderDetails exists for service providers
UserSchema.pre('save', function(next) {
  if (this.userType === UserTypeEnum.SERVICE_PROVIDER && !this.serviceProviderDetails) {
    this.serviceProviderDetails = { approvalStatus: 'pending' };
  }
  next();
});

module.exports = mongoose.model('StandardizedUser', UserSchema); 