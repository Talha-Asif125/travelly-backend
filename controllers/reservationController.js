const ServiceReservation = require('../models/ServiceReservation');
const TourReservation = require('../models/tourBook');
const VehicleReservation = require('../models/VehicleReservation');
const ResturentReservation = require('../models/resturentReservationModel');

// Get customer reservations - for users to see their own reservations
const getCustomerReservations = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    console.log('Fetching reservations for user:', userId);

    // Fetch from all reservation types
    const [serviceReservations, tourReservations, vehicleReservations, restaurantReservations] = await Promise.all([
      ServiceReservation.find({ customerId: userId }).populate('serviceId'),
      TourReservation.find({ 
        $or: [
          { customerId: userId },
          { customerEmail: req.user.email }
        ]
      }),
      VehicleReservation.find({ userId: userId.toString() }),
      ResturentReservation.find({ user: userId }).populate('resturent')
    ]);

    // Combine all reservations
    const allReservations = [
      ...serviceReservations.map(r => ({ ...r.toObject(), type: 'service' })),
      ...tourReservations.map(r => ({ ...r.toObject(), type: 'tour' })),
      ...vehicleReservations.map(r => ({ ...r.toObject(), type: 'vehicle' })),
      ...restaurantReservations.map(r => ({ ...r.toObject(), type: 'restaurant' }))
    ];

    console.log('Found reservations:', allReservations.length);

    res.status(200).json({
      success: true,
      count: allReservations.length,
      data: allReservations
    });
  } catch (error) {
    console.error('Error fetching customer reservations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reservations',
      error: error.message
    });
  }
};

// Get provider reservations - for service providers to see reservations for their services
const getProviderReservations = async (req, res) => {
  try {
    const providerId = req.user.id || req.user._id;
    console.log('=== PROVIDER RESERVATIONS DEBUG ===');
    console.log('Provider ID:', providerId);
    console.log('User object:', req.user);
    
    // Fetch service reservations where this user is the provider
    const serviceReservations = await ServiceReservation.find({ 
      providerId: providerId 
    })
    .populate('serviceId')
    .populate('customerId');
    
    console.log('Found service reservations:', serviceReservations.length);
    
    const formattedServiceReservations = serviceReservations.map(r => {
      const baseReservation = {
        ...r.toObject(),
        customerName: r.customerId?.name || r.customerName,
        customerEmail: r.customerId?.email || r.customerEmail,
        type: r.serviceId?.type || 'service'
      };

      // Format details based on service type
      const serviceType = r.serviceId?.type || 'service';
      let formattedDetails = '';
      let serviceTypeLabel = '';

      switch (serviceType) {
        case 'hotel':
          serviceTypeLabel = 'Hotel Reservation';
          formattedDetails = `Guests: ${r.guests || 1}, Rooms: ${r.rooms || 1}`;
          if (r.roomType) {
            formattedDetails += `, Type: ${r.roomType}`;
          }
          break;
        
        case 'vehicle':
          serviceTypeLabel = 'Vehicle Rental';
          formattedDetails = `Duration: ${r.guests || 1} day(s)`;
          if (r.vehicleType) {
            formattedDetails += `, Vehicle: ${r.vehicleType}`;
          }
          break;
        
        case 'restaurant':
          serviceTypeLabel = 'Restaurant Booking';
          formattedDetails = `Guests: ${r.guests || 1}`;
          if (r.rooms) {
            formattedDetails += `, Table: ${r.rooms}`;
          }
          break;
        
        case 'tour':
          serviceTypeLabel = 'Tour Booking';
          formattedDetails = `Group Size: ${r.groupSize || r.guests || 1}`;
          break;
        
        case 'event':
          serviceTypeLabel = 'Event Booking';
          formattedDetails = `Guests: ${r.guests || 1}`;
          if (r.eventType) {
            formattedDetails += `, Event: ${r.eventType}`;
          }
          break;
        
        default:
          serviceTypeLabel = 'Service Reservation';
          formattedDetails = `Guests: ${r.guests || 1}`;
          if (r.rooms && r.rooms > 1) {
            formattedDetails += `, Units: ${r.rooms}`;
          }
      }

      return {
        ...baseReservation,
        serviceTypeLabel,
        formattedDetails,
        // Keep original fields for backward compatibility but add new formatted ones
        displayDetails: `${serviceTypeLabel} - ${formattedDetails}`
      };
    });
    
    res.status(200).json({
      success: true,
      count: formattedServiceReservations.length,
      data: formattedServiceReservations
    });
    
  } catch (error) {
    console.error('Error fetching provider reservations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch provider reservations',
      error: error.message
    });
  }
};

// Update reservation status (for service providers)
const updateReservationStatus = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { status, rejectionReason } = req.body;
    const providerId = req.user.id || req.user._id;

    console.log('Updating reservation status:', { reservationId, status, providerId });

    // Find the reservation and verify it belongs to this provider
    const reservation = await ServiceReservation.findOne({
      _id: reservationId,
      providerId: providerId
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found or you are not authorized to update it'
      });
    }

    // Update the reservation status
    reservation.status = status;
    reservation.responseDate = new Date();
    
    if (status === 'cancelled' && rejectionReason) {
      reservation.rejectionReason = rejectionReason;
    }

    await reservation.save();

    res.status(200).json({
      success: true,
      message: `Reservation ${status} successfully`,
      data: reservation
    });

  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reservation status',
      error: error.message
    });
  }
};

// Approve a reservation (for service providers)
const approveReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const providerId = req.user.id || req.user._id;

    // Find the reservation and verify it belongs to this provider
    const reservation = await ServiceReservation.findOne({
      _id: reservationId,
      providerId: providerId
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found or you are not authorized to approve it'
      });
    }

    // Update the reservation status
    reservation.status = 'confirmed';
    reservation.responseDate = new Date();
    await reservation.save();

    res.status(200).json({
      success: true,
      message: 'Reservation approved successfully',
      data: reservation
    });

  } catch (error) {
    console.error('Error approving reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve reservation',
      error: error.message
    });
  }
};

// Reject a reservation (for service providers)
const rejectReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { rejectionReason } = req.body;
    const providerId = req.user.id || req.user._id;

    // Find the reservation and verify it belongs to this provider
    const reservation = await ServiceReservation.findOne({
      _id: reservationId,
      providerId: providerId
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found or you are not authorized to reject it'
      });
    }

    // Update the reservation status
    reservation.status = 'cancelled';
    reservation.rejectionReason = rejectionReason || 'Reservation rejected by provider';
    reservation.responseDate = new Date();
    await reservation.save();

    res.status(200).json({
      success: true,
      message: 'Reservation rejected successfully',
      data: reservation
    });

  } catch (error) {
    console.error('Error rejecting reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject reservation',
      error: error.message
    });
  }
};

// Export the functions
module.exports = {
  getCustomerReservations,
  getProviderReservations,
  updateReservationStatus,
  approveReservation,
  rejectReservation
};



