const mongoose = require("mongoose");

const ServiceProviderRequestSchema = new mongoose.Schema(
  {
    // User reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // Personal Details
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: function() {
        return this.providerType !== 'vehicle';
      }
    },
    phone: {
      type: String,
      required: function() {
        return this.providerType !== 'vehicle';
      }
    },
    
    // Business Details - only required for non-vehicle providers
    businessName: {
      type: String,
      required: function() {
        return this.providerType !== 'vehicle';
      }
    },
    businessAddress: {
      type: String,
      required: function() {
        return this.providerType !== 'vehicle';
      }
    },
    businessCity: {
      type: String,
      required: function() {
        return this.providerType !== 'vehicle';
      }
    },
    businessState: {
      type: String,
      required: function() {
        return this.providerType !== 'vehicle';
      }
    },
    businessZip: {
      type: String,
      required: function() {
        return this.providerType !== 'vehicle';
      }
    },
    businessPhone: {
      type: String,
      required: function() {
        return this.providerType !== 'vehicle';
      }
    },
    businessEmail: {
      type: String,
      required: function() {
        return this.providerType !== 'vehicle';
      }
    },
    businessWebsite: {
      type: String,
    },
    
    // Documentation - only required for non-vehicle providers
    registrationNumber: {
      type: String,
      required: function() {
        return this.providerType !== 'vehicle';
      }
    },
    licenseNumber: {
      type: String,
      required: function() {
        return this.providerType !== 'vehicle';
      }
    },
    taxId: {
      type: String,
      required: function() {
        return this.providerType !== 'vehicle';
      }
    },
    
    // Service Details
    providerType: {
      type: String,
      required: true,
      enum: ['hotel', 'vehicle', 'tour', 'restaurant', 'event'],
    },
    serviceDetails: {
      type: String,
      required: function() {
        return this.providerType !== 'vehicle';
      }
    },
    experience: {
      type: Number,
      required: function() {
        return this.providerType !== 'vehicle';
      }
    },
    additionalInfo: {
      type: String,
    },

    // Vehicle-specific fields (only for vehicle providers)
    vehicleDetails: {
      vehicleType: {
        type: String,
        required: function() {
          return this.providerType === 'vehicle';
        }
      },
      make: {
        type: String,
        required: function() {
          return this.providerType === 'vehicle';
        }
      },
      model: {
        type: String,
        required: function() {
          return this.providerType === 'vehicle';
        }
      },
      year: {
        type: Number,
        required: function() {
          return this.providerType === 'vehicle';
        }
      },
      color: {
        type: String,
        required: function() {
          return this.providerType === 'vehicle';
        }
      },
      registrationNumber: {
        type: String,
        required: function() {
          return this.providerType === 'vehicle';
        }
      },
      fuelType: {
        type: String,
        required: function() {
          return this.providerType === 'vehicle';
        }
      },
      transmission: {
        type: String,
        required: function() {
          return this.providerType === 'vehicle';
        }
      },
      capacity: {
        type: Number,
        required: function() {
          return this.providerType === 'vehicle';
        }
      },
      pricePerDay: {
        type: Number,
        required: function() {
          return this.providerType === 'vehicle';
        }
      },
      features: {
        type: String,
        required: function() {
          return this.providerType === 'vehicle';
        }
      },
      description: {
        type: String,
        required: function() {
          return this.providerType === 'vehicle';
        }
      }
    },

    // Document uploads
    documents: {
      profilePicture: String,
      cnicFront: String,
      cnicBack: String,
      // Business documents (only for non-vehicle providers)
      businessLicense: {
        type: String,
        required: function() {
          return this.providerType !== 'vehicle';
        }
      },
      taxCertificate: {
        type: String,
        required: function() {
          return this.providerType !== 'vehicle';
        }
      },
      // Vehicle documents (only for vehicle providers)
      vehicleRegistration: {
        type: String,
        required: function() {
          return this.providerType === 'vehicle';
        }
      },
      drivingLicense: {
        type: String,
        required: function() {
          return this.providerType === 'vehicle';
        }
      },
      vehicleInsurance: {
        type: String,
        required: function() {
          return this.providerType === 'vehicle';
        }
      },
      vehicleImages: {
        type: [String],
        required: function() {
          return this.providerType === 'vehicle';
        }
      }
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