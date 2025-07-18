const mongoose = require("mongoose");

const ServiceReservationSchema = new mongoose.Schema(
  {
    // Customer reference
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // Service reference
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    
    // Provider reference (for easy queries)
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // Booking details
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    guests: {
      type: Number,
      default: 1,
      min: 1,
    },
    
    // Contact information
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    
    // Booking specifics (varies by service type)
    rooms: {
      type: Number,
      default: 1, // For hotels
    },
    roomType: String, // For hotels
    groupSize: Number, // For tours
    vehicleType: String, // For vehicles
    eventType: String, // For events
    specialRequests: String,
    
    // Pricing
    totalAmount: {
      type: Number,
      required: true,
    },
    pricePerUnit: {
      type: Number,
      required: true,
    },
    
    // Status tracking
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    confirmationNumber: {
      type: String,
      unique: true,
      sparse: true, // Only enforce uniqueness if the field exists
    },
    
    // Provider response
    rejectionReason: String,
    responseDate: Date,
    
    // Payment information
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending',
    },
    paymentMethod: String,
    paymentId: String, // For integration with payment gateways
    
    // Dates
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Generate confirmation number
ServiceReservationSchema.pre('save', function(next) {
  if (this.status === 'confirmed' && !this.confirmationNumber) {
    this.confirmationNumber = `TR${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }
  this.updatedAt = new Date();
  next();
});

// Indexes for efficient querying
ServiceReservationSchema.index({ customerId: 1, status: 1 });
ServiceReservationSchema.index({ providerId: 1, status: 1 });
ServiceReservationSchema.index({ serviceId: 1 });
ServiceReservationSchema.index({ confirmationNumber: 1 });

module.exports = mongoose.model("ServiceReservation", ServiceReservationSchema); 