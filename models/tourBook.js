const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tourBookingSchema = new Schema({
  customerId: {
    type: String,
    required: [true, "Customer ID is required"],
  },
  tourId: {
    type: String,
    required: [true, "Tour ID is required"],
  },
  tourOwnerId: {
    type: String,
    required: [true, "Tour owner ID is required"],
  },
  customerName: {
    type: String,
    required: [true, "Customer name is required"],
  },
  customerEmail: {
    type: String,
    required: [true, "Customer email is required"],
  },
  customerPhone: {
    type: String,
    required: [true, "Customer phone is required"],
  },
  tourName: {
    type: String,
    required: [true, "Tour name is required"],
  },
  tourDate: {
    type: Date,
    required: [true, "Tour date is required"],
  },
  guests: {
    type: Number,
    required: [true, "Number of guests is required"],
    min: 1
  },
  tourPrice: {
    type: Number,
    required: [true, "Tour price is required"],
  },
  totalAmount: {
    type: Number,
    required: [true, "Total amount is required"],
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: null
  },
  responseDate: {
    type: Date,
    default: null
  },
  confirmationNumber: {
    type: String,
    default: null
  },
  specialRequests: {
    type: String,
    default: ""
  }
}, { 
  timestamps: true 
});

const TourReservation = mongoose.model("TourReservation", tourBookingSchema);
module.exports = TourReservation;
