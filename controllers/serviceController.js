const Service = require("../models/Service");
const User = require("../models/userModel");

// Get all services
const getServices = async (req, res) => {
  try {
    const { type, city, provider } = req.query;
    
    let filter = { status: 'active' };
    
    if (type) filter.type = type;
    if (city) filter.city = new RegExp(city, 'i');
    if (provider) filter.providerId = provider;
    
    const services = await Service.find(filter)
      .populate('providerId', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services'
    });
  }
};

// Get service by ID with comprehensive details
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('providerId', 'name email phone');
      
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service details'
    });
  }
};

// Get hotel-specific details with amenities and room information
const getHotelDetails = async (req, res) => {
  try {
    const hotelService = await Service.findOne({ 
      _id: req.params.id, 
      type: 'hotel',
      status: 'active'
    }).populate('providerId', 'name email phone');
    
    if (!hotelService) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }
    
    // Format response with comprehensive hotel data
    const hotelData = {
      id: hotelService._id,
      name: hotelService.name,
      description: hotelService.description,
      location: hotelService.location,
      address: hotelService.address,
      city: hotelService.city,
      province: hotelService.province,
      zipCode: hotelService.zipCode,
      coordinates: hotelService.coordinates,
      
      // Pricing
      cheapestPrice: hotelService.price,
      basePrice: hotelService.price,
      
      // Rating and reviews
      rating: hotelService.rating || {
        average: 4.0,
        totalReviews: 0,
        breakdown: {
          cleanliness: 4.0,
          service: 4.0,
          location: 4.0,
          value: 4.0,
          amenities: 4.0
        }
      },
      
      // Images
      images: hotelService.images || [],
      HotelImgs: hotelService.images || [], // For backward compatibility
      
      // Comprehensive amenities
      amenities: hotelService.amenities || {
        popular: ['front-desk-24', 'air-conditioning', 'laundry', 'restaurant', 'free-wifi'],
        parking: ['no-parking'],
        food: ['restaurant'],
        internet: ['free-wifi', 'wifi-all-rooms'],
        family: ['laundry-facilities'],
        conveniences: ['front-desk-24', 'laundry-facilities'],
        guest: ['dry-cleaning', 'housekeeping'],
        accessibility: ['wheelchair-accessible'],
        languages: ['english', 'urdu'],
        entertainment: ['tv', 'cable-channels'],
        more: ['no-smoking']
      },
      
      // Room types and details
      roomTypes: hotelService.roomTypes && hotelService.roomTypes.length > 0 
        ? hotelService.roomTypes 
        : [{
            name: "Standard Room",
            sleeps: 2,
            beds: "1 Double Bed",
            highlights: [
              'Air conditioning',
              'LCD TV',
              'Private bathroom',
              'Free WiFi',
              'Cable channels',
              'Daily housekeeping'
            ],
            amenities: {
              parking: ['No onsite parking available'],
              food: ['A restaurant'],
              internet: ['Available in all rooms: Free WiFi', 'In-room WiFi speed: 25+ Mbps'],
              family: ['Laundry facilities'],
              conveniences: ['24-hour front desk', 'Laundry facilities'],
              guest: ['Dry cleaning/laundry service', 'Housekeeping (on request)'],
              accessibility: ['Upper floors accessible by stairs only', 'Wheelchair accessible (may have limitations)'],
              languages: ['English', 'Urdu'],
              entertainment: ['32-inch LCD TV with cable channels'],
              bathroom: ['Free toiletries', 'Private bathroom', 'Shower', 'Towels provided'],
              more: ['Air conditioning', 'No smoking']
            },
            images: hotelService.images || ['https://via.placeholder.com/800x600?text=Hotel+Room'],
            pricePerNight: hotelService.price,
            totalRooms: hotelService.availableRooms || 10,
            availableRooms: hotelService.availableRooms || 8
          }],
      
      // Policies
      policies: hotelService.policies || {
        checkIn: '14:00',
        checkOut: '12:00',
        cancellation: 'Free cancellation before 24 hours',
        petPolicy: 'Pets not allowed',
        smokingPolicy: 'no-smoking',
        childPolicy: 'Children are welcome'
      },
      
      // Contact information
      contact: hotelService.contact || {
        phone: hotelService.providerId?.phone,
        email: hotelService.providerId?.email
      },
      
      // Provider information
      provider: {
        id: hotelService.providerId._id,
        name: hotelService.providerId.name,
        email: hotelService.providerId.email,
        phone: hotelService.providerId.phone
      },
      
      // Business information
      businessInfo: hotelService.businessInfo,
      
      // Status and metadata
      status: hotelService.status,
      featured: hotelService.featured,
      isService: true,
      createdAt: hotelService.createdAt,
      updatedAt: hotelService.updatedAt
    };
    
    res.status(200).json({
      success: true,
      data: hotelData
    });
  } catch (error) {
    console.error('Error fetching hotel details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hotel details'
    });
  }
};

// Get services by type
const getServicesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { city, minPrice, maxPrice, rating, featured } = req.query;
    
    let filter = { 
      type: type,
      status: 'active'
    };
    
    if (city) filter.city = new RegExp(city, 'i');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (rating) filter['rating.average'] = { $gte: Number(rating) };
    if (featured === 'true') filter.featured = true;
    
    const services = await Service.find(filter)
      .populate('providerId', 'name email phone')
      .sort({ 'rating.average': -1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Error fetching services by type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services'
    });
  }
};

// Create new service
const createService = async (req, res) => {
  try {
    const providerId = req.user?.id;
    
    if (!providerId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const serviceData = {
      ...req.body,
      providerId
    };
    
    const service = new Service(serviceData);
    await service.save();
    
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create service'
    });
  }
};

// Update service
const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    // Check if user owns this service
    if (service.providerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service'
      });
    }
    
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update service'
    });
  }
};

// Delete service
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    // Check if user owns this service
    if (service.providerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this service'
      });
    }
    
    await Service.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service'
    });
  }
};

module.exports = {
  getServices,
  getServiceById,
  getHotelDetails,
  getServicesByType,
  createService,
  updateService,
  deleteService
}; 