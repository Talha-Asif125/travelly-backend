const StandardizedHotel = require('../models/StandardizedHotel');
const StandardizedUser = require('../models/StandardizedUser');
const { BaseModel } = require('../models/BaseModel');
const { AppError } = require('../middleware/errorHandler');

/**
 * Hotel Business Logic Service
 * Separates business logic from controllers
 */
class HotelService {
  /**
   * Create a new hotel
   * @param {Object} hotelData - Hotel information
   * @param {String} ownerId - Owner user ID
   */
  static async createHotel(hotelData, ownerId) {
    // Verify owner exists and is a service provider
    const owner = await StandardizedUser.findById(ownerId);
    if (!owner) {
      throw new AppError('Owner not found', 404);
    }

    if (!owner.isServiceProvider() || !owner.hasApprovedService('hotel')) {
      throw new AppError('User is not approved as a hotel service provider', 403);
    }

    // Create hotel with standardized data
    const hotel = new StandardizedHotel({
      ...hotelData,
      ownerId,
      createdBy: ownerId
    });

    await hotel.save();
    return hotel;
  }

  /**
   * Get hotels with filtering and pagination
   * @param {Object} filters - Search filters
   * @param {Object} options - Pagination and sorting options
   */
  static async getHotels(filters = {}, options = {}) {
    const {
      city,
      province,
      category,
      minPrice,
      maxPrice,
      starRating,
      amenities,
      featured,
      search
    } = filters;

    // Build query
    let query = { isActive: true, status: 'approved' };

    // Location filters
    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }
    if (province) {
      query['address.province'] = new RegExp(province, 'i');
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.$and = query.$and || [];
      if (minPrice) {
        query.$and.push({ 'priceRange.minimum': { $gte: minPrice } });
      }
      if (maxPrice) {
        query.$and.push({ 'priceRange.maximum': { $lte: maxPrice } });
      }
    }

    // Star rating filter
    if (starRating) {
      query.starRating = { $gte: starRating };
    }

    // Amenities filter
    if (amenities && amenities.length > 0) {
      query['amenities.general'] = { $in: amenities };
    }

    // Featured filter
    if (featured) {
      query.isFeatured = true;
    }

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Default sorting
    const sort = options.sort || { 'rating.average': -1, createdAt: -1 };

    return await BaseModel.paginate(StandardizedHotel, query, {
      ...options,
      sort,
      populate: 'ownerId'
    });
  }

  /**
   * Get hotel by ID
   * @param {String} hotelId - Hotel ID
   * @param {Boolean} includeOwner - Whether to populate owner data
   */
  static async getHotelById(hotelId, includeOwner = false) {
    let query = StandardizedHotel.findById(hotelId);
    
    if (includeOwner) {
      query = query.populate('ownerId', 'firstName lastName emailAddress contact');
    }

    const hotel = await query;
    if (!hotel) {
      throw new AppError('Hotel not found', 404);
    }

    return hotel;
  }

  /**
   * Update hotel information
   * @param {String} hotelId - Hotel ID
   * @param {Object} updateData - Data to update
   * @param {String} updatedBy - User ID making the update
   */
  static async updateHotel(hotelId, updateData, updatedBy) {
    const hotel = await this.getHotelById(hotelId);
    
    // Check if user can update this hotel
    if (hotel.ownerId.toString() !== updatedBy) {
      const updater = await StandardizedUser.findById(updatedBy);
      if (!updater?.isAdmin) {
        throw new AppError('You can only update your own hotels', 403);
      }
    }

    // Update hotel
    Object.assign(hotel, updateData);
    hotel.updatedBy = updatedBy;
    
    await hotel.save();
    return hotel;
  }

  /**
   * Delete hotel (soft delete)
   * @param {String} hotelId - Hotel ID
   * @param {String} deletedBy - User ID performing deletion
   */
  static async deleteHotel(hotelId, deletedBy) {
    const hotel = await this.getHotelById(hotelId);
    
    // Check permissions
    if (hotel.ownerId.toString() !== deletedBy) {
      const deleter = await StandardizedUser.findById(deletedBy);
      if (!deleter?.isAdmin) {
        throw new AppError('You can only delete your own hotels', 403);
      }
    }

    await hotel.softDelete();
    return hotel;
  }

  /**
   * Approve hotel
   * @param {String} hotelId - Hotel ID
   * @param {String} approvedBy - Admin user ID
   */
  static async approveHotel(hotelId, approvedBy) {
    const hotel = await this.getHotelById(hotelId);
    
    // Verify approver is admin
    const approver = await StandardizedUser.findById(approvedBy);
    if (!approver?.isAdmin) {
      throw new AppError('Only administrators can approve hotels', 403);
    }

    await hotel.approve(approvedBy);
    return hotel;
  }

  /**
   * Reject hotel
   * @param {String} hotelId - Hotel ID
   * @param {String} reason - Rejection reason
   * @param {String} rejectedBy - Admin user ID
   */
  static async rejectHotel(hotelId, reason, rejectedBy) {
    const hotel = await this.getHotelById(hotelId);
    
    // Verify rejector is admin
    const rejector = await StandardizedUser.findById(rejectedBy);
    if (!rejector?.isAdmin) {
      throw new AppError('Only administrators can reject hotels', 403);
    }

    await hotel.reject(reason, rejectedBy);
    return hotel;
  }

  /**
   * Get hotels by owner
   * @param {String} ownerId - Owner user ID
   * @param {Object} options - Pagination options
   */
  static async getHotelsByOwner(ownerId, options = {}) {
    return await BaseModel.paginate(StandardizedHotel, { ownerId }, options);
  }

  /**
   * Search hotels by location
   * @param {String} city - City name
   * @param {String} province - Province name
   * @param {Object} options - Additional options
   */
  static async searchByLocation(city, province, options = {}) {
    return await StandardizedHotel.findByLocation(city, province);
  }

  /**
   * Get featured hotels
   * @param {Number} limit - Number of hotels to return
   */
  static async getFeaturedHotels(limit = 10) {
    return await StandardizedHotel.findFeatured().limit(limit);
  }

  /**
   * Update hotel rating
   * @param {String} hotelId - Hotel ID
   * @param {Number} rating - New rating (1-5)
   * @param {Object} breakdown - Rating breakdown
   */
  static async updateRating(hotelId, rating, breakdown = {}) {
    const hotel = await this.getHotelById(hotelId);
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    await hotel.updateRating(rating);
    
    // Update breakdown if provided
    if (Object.keys(breakdown).length > 0) {
      Object.assign(hotel.rating.breakdown, breakdown);
      await hotel.save();
    }

    return hotel;
  }

  /**
   * Update room availability
   * @param {String} hotelId - Hotel ID
   * @param {String} roomTypeName - Room type name
   * @param {Number} roomsBooked - Number of rooms booked
   */
  static async updateRoomAvailability(hotelId, roomTypeName, roomsBooked) {
    const hotel = await this.getHotelById(hotelId);
    await hotel.updateRoomAvailability(roomTypeName, roomsBooked);
    return hotel;
  }

  /**
   * Get hotel statistics
   * @param {String} hotelId - Hotel ID
   */
  static async getHotelStatistics(hotelId) {
    const hotel = await this.getHotelById(hotelId);
    
    return {
      totalRooms: hotel.totalRooms,
      availableRooms: hotel.availableRooms,
      occupancyRate: hotel.occupancyRate,
      rating: hotel.rating,
      statistics: hotel.statistics
    };
  }

  /**
   * Get pending approvals (admin only)
   * @param {Object} options - Pagination options
   */
  static async getPendingApprovals(options = {}) {
    return await BaseModel.paginate(
      StandardizedHotel, 
      { status: 'pending' }, 
      options
    );
  }

  /**
   * Search hotels with advanced filters
   * @param {Object} searchCriteria - Advanced search criteria
   */
  static async advancedSearch(searchCriteria) {
    const {
      checkIn,
      checkOut,
      guests,
      rooms,
      ...filters
    } = searchCriteria;

    // Base hotel filtering
    let hotels = await this.getHotels(filters);

    // Additional filtering based on availability (if dates provided)
    if (checkIn && checkOut) {
      // This would integrate with a booking system to check availability
      // For now, we'll just return the filtered hotels
    }

    return hotels;
  }
}

module.exports = HotelService; 