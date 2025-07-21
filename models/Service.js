const mongoose = require("mongoose");

// Comprehensive amenities schema for hotels
const HotelAmenitiesSchema = new mongoose.Schema({
  popular: [{
    type: String,
    enum: ['front-desk-24', 'air-conditioning', 'laundry', 'restaurant', 'free-wifi', 'pool', 'gym', 'spa', 'bar', 'parking']
  }],
  parking: [{
    type: String,
    enum: ['free-parking', 'paid-parking', 'valet-parking', 'no-parking', 'street-parking']
  }],
  food: [{
    type: String,
    enum: ['restaurant', 'room-service', 'breakfast', 'bar', 'kitchen', 'microwave', 'refrigerator']
  }],
  internet: [{
    type: String,
    enum: ['free-wifi', 'paid-wifi', 'wifi-all-rooms', 'business-center', 'wifi-speed-high']
  }],
  family: [{
    type: String,
    enum: ['family-friendly', 'kids-club', 'babysitting', 'playground', 'laundry-facilities']
  }],
  conveniences: [{
    type: String,
    enum: ['front-desk-24', 'concierge', 'laundry-facilities', 'dry-cleaning', 'luggage-storage', 'currency-exchange']
  }],
  guest: [{
    type: String,
    enum: ['dry-cleaning', 'housekeeping', 'wake-up-service', 'newspaper', 'shoe-shine']
  }],
  accessibility: [{
    type: String,
    enum: ['wheelchair-accessible', 'elevator', 'accessible-rooms', 'accessible-bathroom', 'braille-signage']
  }],
  languages: [{
    type: String,
    enum: ['english', 'urdu', 'arabic', 'french', 'spanish', 'chinese']
  }],
  entertainment: [{
    type: String,
    enum: ['tv', 'cable-channels', 'satellite-tv', 'netflix', 'music-system', 'games-room']
  }],
  more: [{
    type: String,
    enum: ['no-smoking', 'smoking-rooms', 'pet-friendly', 'eco-friendly', 'adults-only']
  }]
}, { _id: false });

// Room details schema
const RoomTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  sleeps: {
    type: Number,
    required: true,
    min: 1
  },
  beds: {
    type: String,
    required: true
  },
  highlights: [{
    type: String
  }],
  amenities: {
    parking: [String],
    food: [String],
    internet: [String],
    family: [String],
    conveniences: [String],
    guest: [String],
    accessibility: [String],
    languages: [String],
    entertainment: [String],
    bathroom: [String],
    more: [String]
  },
  images: [String],
  pricePerNight: {
    type: Number,
    required: true,
    min: 0
  },
  totalRooms: {
    type: Number,
    default: 1,
    min: 0
  },
  availableRooms: {
    type: Number,
    default: 1,
    min: 0
  }
}, { _id: false });

const ServiceSchema = new mongoose.Schema(
  {
    // Provider reference
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // Basic service information
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['hotel', 'vehicle', 'tour', 'restaurant', 'event'],
    },
    price: {
      type: Number,
      required: true,
    },
    
    // Enhanced Hotel specific fields
    location: String,
    address: String,
    city: String,
    province: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    
    // Hotel amenities and features
    amenities: {
      type: HotelAmenitiesSchema,
      default: {}
    },
    
    // Room information for hotels
    roomTypes: [RoomTypeSchema],
    
    // Hotel policies
    policies: {
      checkIn: {
        type: String,
        default: '14:00'
      },
      checkOut: {
        type: String,
        default: '12:00'
      },
      cancellation: String,
      petPolicy: String,
      smokingPolicy: {
        type: String,
        enum: ['no-smoking', 'smoking-areas', 'smoking-rooms-available'],
        default: 'no-smoking'
      },
      childPolicy: String
    },
    
    // Hotel rating and reviews
    rating: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
      },
      totalReviews: {
        type: Number,
        default: 0
      },
      breakdown: {
        cleanliness: { type: Number, min: 0, max: 5, default: 0 },
        service: { type: Number, min: 0, max: 5, default: 0 },
        location: { type: Number, min: 0, max: 5, default: 0 },
        value: { type: Number, min: 0, max: 5, default: 0 },
        amenities: { type: Number, min: 0, max: 5, default: 0 }
      }
    },
    
    // Contact information
    contact: {
      phone: String,
      email: String,
      website: String
    },
    
    // Legacy hotel fields for backward compatibility
    roomType: String,
    availableRooms: Number,
    
    // Simplified hotel fields
    starRating: Number,
    totalRooms: Number,
    checkInTime: String,
    checkOutTime: String,
    facilities: String,
    
    // Tour specific fields
    duration: String,
    maxGroupSize: Number,
    tourDate: Date,       // Specific tour date for scheduled tours
    departureTime: String, // Tour departure time (e.g., "09:00", "14:30")
    category: String,     // Tour/Travel category (e.g., "Sun and Beach", "City Travel")
    fromLocation: String, // Starting point for travel services
    toLocation: String,   // Destination point for travel services
    availableSeats: Number, // Available seats for travel services
    
    // Vehicle specific fields
    vehicleType: String,
    vehicleBrand: String,     // Vehicle make/brand (e.g., Toyota, Honda)
    vehicleModel: String,     // Vehicle model (e.g., Corolla, Civic)
    vehicleYear: Number,      // Manufacturing year
    vehicleNumber: String,    // Registration/license plate number
    capacity: Number,         // Legacy field - maps to seatingCapacity
    seatingCapacity: Number,  // Number of seats/passengers
    features: String,
    
    // Restaurant specific fields
    cuisineType: String,
    specialties: String,
    seatingCapacity: Number,
    totalTables: Number,
    maxTableSize: Number,
    operatingHours: {
      opening: String,
      closing: String
    },
    
    // Flight specific fields
    aircraftType: String,
    routes: String,
    from: String,           // Origin location/airport
    to: String,             // Destination location/airport
    arrivalTime: String,    // Arrival time
    departureTime: String,  // Departure time
    flightNumber: String,   // Flight identifier
    airline: String,        // Airline name
    
    // Event specific fields
    eventType: String,
    venueType: String,
    maxCapacity: Number,
    minCapacity: Number,
    maxAttendees: Number, // Legacy field for backward compatibility
    venue: String, // Legacy field for backward compatibility
    priceType: String,
    eventDuration: Number,
    eventDate: String,
    startTime: String,
    endTime: String,
    services: String,
    
    // Train specific fields
    trainType: String,
    route: String,
    trainAmenities: String,  // Changed from 'amenities' to 'trainAmenities' to avoid conflict
    trainNumber: String,    // Train identifier
    classType: String,      // First class, Business, Economy
    maxBaggage: String,     // Baggage allowance
    cancelCharges: String,  // Cancellation charges
    availableSeats: Number, // Available seats
    
    // Common scheduling fields for trains and flights
    scheduleDate: String,   // Specific date for the service
    
    // Service status
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'suspended'],
      default: 'active',
    },
    
    // Additional metadata
    images: [String],
    featured: {
      type: Boolean,
      default: false,
    },
    
    // Business information
    businessInfo: {
      registrationNumber: String,
      taxId: String,
      licenses: [{
        type: String,
        name: String,
        issueDate: Date,
        expiryDate: Date
      }]
    },
    
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

// Index for efficient querying
ServiceSchema.index({ providerId: 1, type: 1 });
ServiceSchema.index({ type: 1, status: 1 });
ServiceSchema.index({ from: 1, to: 1, type: 1 }); // For train/flight route searches
ServiceSchema.index({ city: 1, type: 1 }); // For location-based searches
ServiceSchema.index({ 'rating.average': -1 }); // For rating-based sorting

module.exports = mongoose.model("Service", ServiceSchema); 