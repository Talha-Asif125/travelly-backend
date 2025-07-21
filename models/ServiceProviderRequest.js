const mongoose = require("mongoose");

const ServiceProviderRequestSchema = new mongoose.Schema(
  {
    // User reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // Personal Details & Identity (common for all)
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    cnic: {
      type: String,
      required: true,
    },
    mobileForOTP: {
      type: String,
      required: true,
    },
    
    // Service Details
    providerType: {
      type: String,
      required: true,
      enum: ['hotel', 'vehicle', 'tour', 'restaurant', 'event'],
    },

    // Hotel-specific fields (only for hotel providers)
    hotelName: {
      type: String,
      required: function() { return this.providerType === 'hotel'; }
    },
    hotelAddress: {
      type: String,
      required: function() { return this.providerType === 'hotel'; }
    },
    propertyType: {
      type: String,
      required: function() { return this.providerType === 'hotel'; }
    },
    numberOfRooms: {
      type: Number,
      required: function() { return this.providerType === 'hotel'; }
    },
    starRating: {
      type: Number,
      required: function() { return this.providerType === 'hotel'; }
    },
    priceRangeMin: {
      type: Number,
      required: function() { return this.providerType === 'hotel'; }
    },
    priceRangeMax: {
      type: Number,
      required: function() { return this.providerType === 'hotel'; }
    },
    hotelPhone: {
      type: String,
      required: function() { return this.providerType === 'hotel'; }
    },
    hotelEmail: {
      type: String,
      required: function() { return this.providerType === 'hotel'; }
    },
    amenities: {
      type: [String],
      default: []
    },

    // Restaurant-specific fields (only for restaurant providers)
    restaurantName: {
      type: String,
      required: function() { return this.providerType === 'restaurant'; }
    },
    restaurantAddress: {
      type: String,
      required: function() { return this.providerType === 'restaurant'; }
    },
    cuisineType: {
      type: String,
      required: function() { return this.providerType === 'restaurant'; }
    },
    seatingCapacity: {
      type: Number,
      required: function() { return this.providerType === 'restaurant'; }
    },
    restaurantPhone: {
      type: String,
      required: function() { return this.providerType === 'restaurant'; }
    },
    restaurantEmail: {
      type: String,
      required: function() { return this.providerType === 'restaurant'; }
    },

    // Event-specific fields (only for event providers)
    eventName: {
      type: String,
      required: function() { return this.providerType === 'event'; }
    },
    eventAddress: {
      type: String,
      required: function() { return this.providerType === 'event'; }
    },
    eventPhone: {
      type: String,
      required: function() { return this.providerType === 'event'; }
    },
    eventEmail: {
      type: String,
      required: function() { return this.providerType === 'event'; }
    },

    // Vehicle-specific fields (only for vehicle providers)
    shopName: {
      type: String,
      required: function() { return this.providerType === 'vehicle'; }
    },
    shopCity: {
      type: String,
      required: function() { return this.providerType === 'vehicle'; }
    },
    shopAddress: {
      type: String,
      required: function() { return this.providerType === 'vehicle'; }
    },
    fleetSize: {
      type: Number,
      required: function() { return this.providerType === 'vehicle'; }
    },
    shopPhone: {
      type: String,
      required: function() { return this.providerType === 'vehicle'; }
    },
    shopDescription: {
      type: String,
      required: function() { return this.providerType === 'vehicle'; }
    },

    // Document uploads (structure matches frontend)
    documents: {
      // Common for all providers
      cnicCopy: {
        type: String,
        required: true
      },
      // Hotel: licensePhoto
      licensePhoto: {
        type: String,
        required: function() { return this.providerType === 'hotel' || this.providerType === 'tour'; }
      },
      // Restaurant: restaurantPhotos (multiple)
      restaurantPhotos: {
        type: [String],
        default: [],
        required: function() { return this.providerType === 'restaurant'; }
      },
      // Event: eventPhotos (multiple)
      eventPhotos: {
        type: [String],
        default: [],
        required: function() { return this.providerType === 'event'; }
      },
      // Vehicle: vehiclePhotos (multiple)
      vehiclePhotos: {
        type: [String],
        default: [],
        required: function() { return this.providerType === 'vehicle'; }
      }
    },

    additionalInfo: {
      type: String,
    },
    
    // Status and Review
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    
    // Submission Details
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index to prevent duplicate applications for same user and provider type
ServiceProviderRequestSchema.index(
  { userId: 1, providerType: 1 }, 
  { 
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'approved'] } }
  }
);

// Index for efficient querying
ServiceProviderRequestSchema.index({ userId: 1, status: 1 });
ServiceProviderRequestSchema.index({ status: 1, submittedAt: -1 });

module.exports = mongoose.model("ServiceProviderRequest", ServiceProviderRequestSchema); 