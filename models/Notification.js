const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    // User reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // Notification content
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'provider_request_submitted',
        'provider_request_approved',
        'provider_request_rejected',
        'new_reservation',
        'reservation_approved',
        'reservation_rejected',
        'reservation_cancelled',
        'service_added',
        'service_updated',
        'payment_confirmed',
        'system_maintenance',
        'new_service_booking',
        'booking_confirmed',
        'booking_cancelled',
        'booking_updated',
        'booking_deleted'
      ]
    },
    
    // Status
    read: {
      type: Boolean,
      default: false,
    },
    
    // Metadata
    data: {
      type: mongoose.Schema.Types.Mixed, // For storing additional data
    },
    
    // Dates
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for efficient querying
NotificationSchema.index({ userId: 1, timestamp: -1 });
NotificationSchema.index({ userId: 1, read: 1 });

module.exports = mongoose.model("Notification", NotificationSchema); 