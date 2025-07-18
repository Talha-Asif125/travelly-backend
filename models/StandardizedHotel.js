const mongoose = require('mongoose');
const { 
  BaseModel, 
  AddressSchema, 
  ContactSchema, 
  StatusEnum 
} = require('./BaseModel');

/**
 * Standardized Hotel Model
 * Consistent field naming and comprehensive hotel management
 */

const HotelSchema = BaseModel.createSchema({
  // Basic Information
  hotelName: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true,
    maxlength: [100, 'Hotel name cannot exceed 100 characters'],
    index: true
  },
  description: {
    type: String,
    required: [true, 'Hotel description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    enum: ['budget', 'mid-range', 'luxury', 'resort', 'boutique', 'business'],
    required: true,
    index: true
  },
  starRating: {
    type: Number,
    min: [1, 'Star rating must be at least 1'],
    max: [5, 'Star rating cannot exceed 5'],
    required: true
  },
  
  // Owner Information
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StandardizedUser',
    required: true,
    index: true
  },
  
  // Location
  address: {
    type: AddressSchema,
    required: true
  },
  
  // Contact Information
  contact: {
    type: ContactSchema,
    required: true
  },
  
  // Pricing
  priceRange: {
    minimum: {
      type: Number,
      required: [true, 'Minimum price is required'],
      min: [0, 'Price cannot be negative']
    },
    maximum: {
      type: Number,
      required: [true, 'Maximum price is required'],
      min: [0, 'Price cannot be negative'],
      validate: {
        validator: function(v) {
          return v >= this.priceRange.minimum;
        },
        message: 'Maximum price must be greater than or equal to minimum price'
      }
    },
    currency: {
      type: String,
      default: 'LKR',
      enum: ['LKR', 'USD', 'EUR']
    }
  },
  
  // Ratings and Reviews
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0
    },
    breakdown: {
      cleanliness: { type: Number, min: 0, max: 5, default: 0 },
      service: { type: Number, min: 0, max: 5, default: 0 },
      location: { type: Number, min: 0, max: 5, default: 0 },
      value: { type: Number, min: 0, max: 5, default: 0 },
      amenities: { type: Number, min: 0, max: 5, default: 0 }
    }
  },
  
  // Media
  images: {
    featured: {
      type: String,
      required: [true, 'Featured image is required']
    },
    gallery: [{
      type: String,
      validate: {
        validator: function(v) {
          return v && v.length > 0;
        },
        message: 'At least one gallery image is required'
      }
    }],
    certificates: [{
      type: String
    }]
  },
  
  // Amenities and Features
  amenities: {
    general: [{
      type: String,
      enum: [
        'wifi', 'parking', 'pool', 'gym', 'spa', 'restaurant', 'bar',
        'room-service', 'laundry', 'business-center', 'conference-rooms',
        'airport-shuttle', 'pet-friendly', 'family-friendly', 'accessible'
      ]
    }],
    room: [{
      type: String,
      enum: [
        'air-conditioning', 'heating', 'tv', 'minibar', 'safe',
        'balcony', 'sea-view', 'mountain-view', 'city-view'
      ]
    }],
    business: [{
      type: String,
      enum: [
        'meeting-rooms', 'projector', 'whiteboard', 'video-conferencing',
        'business-lounge', 'secretarial-services'
      ]
    }]
  },
  
  // Room Information
  roomTypes: [{
    name: {
      type: String,
      required: true
    },
    capacity: {
      adults: { type: Number, required: true, min: 1 },
      children: { type: Number, default: 0, min: 0 }
    },
    totalRooms: {
      type: Number,
      required: true,
      min: 1
    },
    availableRooms: {
      type: Number,
      required: true,
      min: 0
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0
    },
    amenities: [String],
    images: [String]
  }],
  
  // Policies
  policies: {
    checkIn: {
      type: String,
      default: '14:00',
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid check-in time format']
    },
    checkOut: {
      type: String,
      default: '12:00',
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid check-out time format']
    },
    cancellation: {
      type: String,
      required: true
    },
    petPolicy: String,
    smokingPolicy: {
      type: String,
      enum: ['no-smoking', 'smoking-areas', 'smoking-rooms-available'],
      default: 'no-smoking'
    },
    childPolicy: String
  },
  
  // Business Information
  business: {
    registrationNumber: String,
    taxId: String,
    licenses: [{
      type: String,
      name: String,
      issueDate: Date,
      expiryDate: Date
    }]
  },
  
  // Status and Approval
  status: {
    type: String,
    enum: Object.values(StatusEnum),
    default: StatusEnum.PENDING,
    index: true
  },
  approvalDetails: {
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StandardizedUser'
    },
    approvedAt: Date,
    rejectionReason: String,
    notes: String
  },
  
  // Operational Status
  isOperational: {
    type: Boolean,
    default: true
  },
  temporarilyClosed: {
    type: Boolean,
    default: false
  },
  closureReason: String,
  
  // Features
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  sustainabilityRating: {
    type: String,
    enum: ['none', 'bronze', 'silver', 'gold', 'platinum'],
    default: 'none'
  },
  
  // Statistics
  statistics: {
    totalBookings: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageOccupancy: { type: Number, default: 0 },
    lastBookingDate: Date
  },
  
  // Legacy fields for backward compatibility (deprecated)
  name: {
    type: String,
    get: function() {
      return this.hotelName;
    }
  },
  title: {
    type: String,
    get: function() {
      return this.hotelName;
    }
  },
  type: {
    type: String,
    get: function() {
      return this.category;
    }
  },
  city: {
    type: String,
    get: function() {
      return this.address?.city;
    }
  },
  province: {
    type: String,
    get: function() {
      return this.address?.province;
    }
  },
  zip: {
    type: Number,
    get: function() {
      return parseInt(this.address?.zipCode);
    }
  },
  contactName: {
    type: String,
    get: function() {
      return this.ownerId; // This would need to be populated
    }
  },
  contactNo: {
    type: Number,
    get: function() {
      return parseInt(this.contact?.phoneNumber?.replace(/[^\d]/g, ''));
    }
  },
  cheapestPrice: {
    type: Number,
    get: function() {
      return this.priceRange?.minimum;
    }
  },
  HotelImgs: {
    type: [String],
    get: function() {
      return this.images?.gallery || [];
    }
  },
  isApproved: {
    type: Boolean,
    get: function() {
      return this.status === StatusEnum.APPROVED;
    }
  },
  featured: {
    type: Boolean,
    get: function() {
      return this.isFeatured;
    }
  }
});

// Indexes for performance
HotelSchema.index({ hotelName: 'text', description: 'text' });
HotelSchema.index({ 'address.city': 1, 'address.province': 1 });
HotelSchema.index({ category: 1, starRating: 1 });
HotelSchema.index({ 'priceRange.minimum': 1, 'priceRange.maximum': 1 });
HotelSchema.index({ 'rating.average': -1 });
HotelSchema.index({ isFeatured: 1, status: 1 });

// Virtual for total rooms
HotelSchema.virtual('totalRooms').get(function() {
  return this.roomTypes.reduce((total, roomType) => total + roomType.totalRooms, 0);
});

// Virtual for available rooms
HotelSchema.virtual('availableRooms').get(function() {
  return this.roomTypes.reduce((total, roomType) => total + roomType.availableRooms, 0);
});

// Virtual for occupancy rate
HotelSchema.virtual('occupancyRate').get(function() {
  const total = this.totalRooms;
  const available = this.availableRooms;
  return total > 0 ? ((total - available) / total) * 100 : 0;
});

// Instance Methods
HotelSchema.methods.updateRating = function(newRating) {
  const currentTotal = this.rating.totalReviews;
  const currentAverage = this.rating.average;
  
  this.rating.totalReviews += 1;
  this.rating.average = ((currentAverage * currentTotal) + newRating) / this.rating.totalReviews;
  
  return this.save();
};

HotelSchema.methods.updateRoomAvailability = function(roomTypeName, roomsBooked) {
  const roomType = this.roomTypes.find(rt => rt.name === roomTypeName);
  if (roomType) {
    roomType.availableRooms = Math.max(0, roomType.availableRooms - roomsBooked);
  }
  return this.save();
};

HotelSchema.methods.approve = function(approvedBy) {
  this.status = StatusEnum.APPROVED;
  this.approvalDetails.approvedBy = approvedBy;
  this.approvalDetails.approvedAt = new Date();
  return this.save();
};

HotelSchema.methods.reject = function(reason, rejectedBy) {
  this.status = StatusEnum.REJECTED;
  this.approvalDetails.rejectionReason = reason;
  this.approvalDetails.approvedBy = rejectedBy;
  this.approvalDetails.approvedAt = new Date();
  return this.save();
};

// Static Methods
HotelSchema.statics.findByLocation = function(city, province) {
  return this.find({
    'address.city': new RegExp(city, 'i'),
    'address.province': new RegExp(province, 'i'),
    status: StatusEnum.APPROVED,
    isActive: true
  });
};

HotelSchema.statics.findByPriceRange = function(minPrice, maxPrice) {
  return this.find({
    'priceRange.minimum': { $lte: maxPrice },
    'priceRange.maximum': { $gte: minPrice },
    status: StatusEnum.APPROVED,
    isActive: true
  });
};

HotelSchema.statics.findFeatured = function() {
  return this.find({
    isFeatured: true,
    status: StatusEnum.APPROVED,
    isActive: true
  }).sort({ 'rating.average': -1 });
};

module.exports = mongoose.model('StandardizedHotel', HotelSchema); 