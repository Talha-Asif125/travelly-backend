const mongoose = require('mongoose');

/**
 * Base Model Schema
 * Provides common fields and methods for all models
 */

// Common address sub-schema
const AddressSchema = new mongoose.Schema({
  street: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  province: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    default: 'Sri Lanka',
    trim: true
  },
  coordinates: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  }
}, { _id: false });

// Common contact sub-schema
const ContactSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Invalid email format']
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    match: [/^[+]?[\s./0-9]*[(]?[\s./0-9]*[)]?[-\s./0-9]*$/g, 'Invalid phone number format']
  },
  alternatePhoneNumber: {
    type: String,
    trim: true,
    match: [/^[+]?[\s./0-9]*[(]?[\s./0-9]*[)]?[-\s./0-9]*$/g, 'Invalid phone number format']
  }
}, { _id: false });

// Base options for all schemas
const baseSchemaOptions = {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
};

// Base schema fields that all models should have
const baseFields = {
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  }
};

// Common status enum
const StatusEnum = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
  ARCHIVED: 'archived'
};

// Common service type enum
const ServiceTypeEnum = {
  HOTEL: 'hotel',
  VEHICLE: 'vehicle', 
  TOUR: 'tour',
  RESTAURANT: 'restaurant',
  EVENT: 'event',
  ACTIVITY: 'activity'
};

// Common user type enum
const UserTypeEnum = {
  CUSTOMER: 'customer',
  SERVICE_PROVIDER: 'serviceProvider',
  ADMIN: 'admin',
  FINANCE_MANAGER: 'financeManager',
  EVENT_ORGANIZER: 'eventOrganizer'
};

/**
 * Base Model Class
 * Provides common methods for all models
 */
class BaseModel {
  /**
   * Create a standardized schema with base fields
   * @param {Object} schemaDefinition - Model-specific schema fields
   * @param {Object} options - Additional schema options
   */
  static createSchema(schemaDefinition, options = {}) {
    const schema = new mongoose.Schema(
      {
        ...schemaDefinition,
        ...baseFields
      },
      {
        ...baseSchemaOptions,
        ...options
      }
    );

    // Add common indexes
    schema.index({ createdAt: -1 });
    schema.index({ updatedAt: -1 });
    schema.index({ isActive: 1 });

    // Add common virtual fields
    schema.virtual('id').get(function() {
      return this._id.toHexString();
    });

    // Add common pre-save middleware
    schema.pre('save', function(next) {
      this.updatedAt = new Date();
      next();
    });

    // Add common methods
    schema.methods.softDelete = function() {
      this.isActive = false;
      return this.save();
    };

    schema.methods.restore = function() {
      this.isActive = true;
      return this.save();
    };

    // Add common static methods
    schema.statics.findActive = function(filter = {}) {
      return this.find({ ...filter, isActive: true });
    };

    schema.statics.findById = function(id) {
      return this.findOne({ _id: id, isActive: true });
    };

    return schema;
  }

  /**
   * Create a paginated query
   * @param {Object} model - Mongoose model
   * @param {Object} filter - Query filter
   * @param {Object} options - Pagination options
   */
  static async paginate(model, filter = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
      populate = '',
      select = ''
    } = options;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      model.find({ ...filter, isActive: true })
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate(populate)
        .select(select),
      model.countDocuments({ ...filter, isActive: true })
    ]);

    return {
      data,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }
}

module.exports = {
  BaseModel,
  AddressSchema,
  ContactSchema,
  StatusEnum,
  ServiceTypeEnum,
  UserTypeEnum,
  baseSchemaOptions,
  baseFields
}; 