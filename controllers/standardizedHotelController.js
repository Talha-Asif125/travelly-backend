const HotelService = require('../services/HotelService');
const ApiResponse = require('../utils/ApiResponse');
const { catchAsync } = require('../middleware/errorHandler');

/**
 * Standardized Hotel Controller
 * Uses business logic service layer and consistent API responses
 */

// @desc    Create a new hotel
// @route   POST /api/hotels
// @access  Private (Service Providers only)
const createHotel = catchAsync(async (req, res) => {
  const hotel = await HotelService.createHotel(req.body, req.user.id);
  
  res.status(201).json(
    ApiResponse.success(
      hotel,
      'Hotel created successfully. Pending admin approval.',
      201
    )
  );
});

// @desc    Get all hotels with filtering and pagination
// @route   GET /api/hotels
// @access  Public
const getHotels = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sort,
    city,
    province,
    category,
    minPrice,
    maxPrice,
    starRating,
    amenities,
    featured,
    search
  } = req.query;

  const filters = {
    city,
    province,
    category,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    starRating: starRating ? parseInt(starRating) : undefined,
    amenities: amenities ? amenities.split(',') : undefined,
    featured: featured === 'true',
    search
  };

  // Remove undefined values
  Object.keys(filters).forEach(key => 
    filters[key] === undefined && delete filters[key]
  );

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: sort ? JSON.parse(sort) : undefined
  };

  const result = await HotelService.getHotels(filters, options);
  
  res.status(200).json(
    ApiResponse.success(
      result,
      'Hotels retrieved successfully'
    )
  );
});

// @desc    Get hotel by ID
// @route   GET /api/hotels/:id
// @access  Public
const getHotelById = catchAsync(async (req, res) => {
  const { includeOwner = 'false' } = req.query;
  const hotel = await HotelService.getHotelById(
    req.params.id, 
    includeOwner === 'true'
  );
  
  res.status(200).json(
    ApiResponse.success(
      hotel,
      'Hotel retrieved successfully'
    )
  );
});

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Private (Owner or Admin)
const updateHotel = catchAsync(async (req, res) => {
  const hotel = await HotelService.updateHotel(
    req.params.id,
    req.body,
    req.user.id
  );
  
  res.status(200).json(
    ApiResponse.success(
      hotel,
      'Hotel updated successfully'
    )
  );
});

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
// @access  Private (Owner or Admin)
const deleteHotel = catchAsync(async (req, res) => {
  await HotelService.deleteHotel(req.params.id, req.user.id);
  
  res.status(200).json(
    ApiResponse.success(
      null,
      'Hotel deleted successfully'
    )
  );
});

// @desc    Approve hotel (Admin only)
// @route   POST /api/hotels/:id/approve
// @access  Private (Admin only)
const approveHotel = catchAsync(async (req, res) => {
  const hotel = await HotelService.approveHotel(req.params.id, req.user.id);
  
  res.status(200).json(
    ApiResponse.success(
      hotel,
      'Hotel approved successfully'
    )
  );
});

// @desc    Reject hotel (Admin only)
// @route   POST /api/hotels/:id/reject
// @access  Private (Admin only)
const rejectHotel = catchAsync(async (req, res) => {
  const { reason } = req.body;
  const hotel = await HotelService.rejectHotel(
    req.params.id,
    reason,
    req.user.id
  );
  
  res.status(200).json(
    ApiResponse.success(
      hotel,
      'Hotel rejected successfully'
    )
  );
});

// @desc    Get hotels by owner
// @route   GET /api/hotels/owner/:ownerId
// @access  Private (Owner or Admin)
const getHotelsByOwner = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  // Check if user can access this owner's hotels
  if (req.params.ownerId !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json(
      ApiResponse.authorizationError('You can only view your own hotels')
    );
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await HotelService.getHotelsByOwner(req.params.ownerId, options);
  
  res.status(200).json(
    ApiResponse.success(
      result,
      'Owner hotels retrieved successfully'
    )
  );
});

// @desc    Search hotels by location
// @route   GET /api/hotels/search/location
// @access  Public
const searchByLocation = catchAsync(async (req, res) => {
  const { city, province } = req.query;
  
  if (!city && !province) {
    return res.status(400).json(
      ApiResponse.error('City or province parameter is required')
    );
  }

  const hotels = await HotelService.searchByLocation(city, province);
  
  res.status(200).json(
    ApiResponse.success(
      hotels,
      'Location search completed successfully'
    )
  );
});

// @desc    Get featured hotels
// @route   GET /api/hotels/featured
// @access  Public
const getFeaturedHotels = catchAsync(async (req, res) => {
  const { limit = 10 } = req.query;
  const hotels = await HotelService.getFeaturedHotels(parseInt(limit));
  
  res.status(200).json(
    ApiResponse.success(
      hotels,
      'Featured hotels retrieved successfully'
    )
  );
});

// @desc    Update hotel rating
// @route   POST /api/hotels/:id/rating
// @access  Private (Authenticated users only)
const updateRating = catchAsync(async (req, res) => {
  const { rating, breakdown } = req.body;
  
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json(
      ApiResponse.error('Rating must be between 1 and 5')
    );
  }

  const hotel = await HotelService.updateRating(
    req.params.id,
    rating,
    breakdown
  );
  
  res.status(200).json(
    ApiResponse.success(
      hotel,
      'Hotel rating updated successfully'
    )
  );
});

// @desc    Update room availability
// @route   POST /api/hotels/:id/rooms/availability
// @access  Private (Owner or Admin)
const updateRoomAvailability = catchAsync(async (req, res) => {
  const { roomTypeName, roomsBooked } = req.body;
  
  if (!roomTypeName || roomsBooked === undefined) {
    return res.status(400).json(
      ApiResponse.error('Room type name and rooms booked are required')
    );
  }

  const hotel = await HotelService.updateRoomAvailability(
    req.params.id,
    roomTypeName,
    parseInt(roomsBooked)
  );
  
  res.status(200).json(
    ApiResponse.success(
      hotel,
      'Room availability updated successfully'
    )
  );
});

// @desc    Get hotel statistics
// @route   GET /api/hotels/:id/statistics
// @access  Private (Owner or Admin)
const getHotelStatistics = catchAsync(async (req, res) => {
  const statistics = await HotelService.getHotelStatistics(req.params.id);
  
  res.status(200).json(
    ApiResponse.success(
      statistics,
      'Hotel statistics retrieved successfully'
    )
  );
});

// @desc    Get pending approvals (Admin only)
// @route   GET /api/hotels/pending-approvals
// @access  Private (Admin only)
const getPendingApprovals = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  const options = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await HotelService.getPendingApprovals(options);
  
  res.status(200).json(
    ApiResponse.success(
      result,
      'Pending approvals retrieved successfully'
    )
  );
});

// @desc    Advanced hotel search
// @route   POST /api/hotels/search/advanced
// @access  Public
const advancedSearch = catchAsync(async (req, res) => {
  const searchCriteria = req.body;
  const result = await HotelService.advancedSearch(searchCriteria);
  
  res.status(200).json(
    ApiResponse.success(
      result,
      'Advanced search completed successfully'
    )
  );
});

module.exports = {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  approveHotel,
  rejectHotel,
  getHotelsByOwner,
  searchByLocation,
  getFeaturedHotels,
  updateRating,
  updateRoomAvailability,
  getHotelStatistics,
  getPendingApprovals,
  advancedSearch
}; 