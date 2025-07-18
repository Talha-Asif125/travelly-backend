const TourReservation = require("../models/tourBook");

const bookTour = async (req, res) => {
  try {
    console.log("Creating tour reservation with data:", req.body);
    
    const {
      tourId,
      tourOwnerId,
      customerName,
      customerEmail,
      customerPhone,
      tourDate,
      guests,
      tourName,
      tourPrice,
      totalAmount,
      specialRequests
    } = req.body;

    // Basic validation
    if (!tourId || !tourOwnerId || !customerName || !customerEmail || !customerPhone || !tourDate || !guests || !tourName || !tourPrice || !totalAmount) {
      return res.status(400).json({
        status: "Unsuccess",
        message: "Missing required fields"
      });
    }

    // Create new tour reservation
    const newReservation = new TourReservation({
      customerId: req.user?.id || customerEmail, // Use user ID if available
      tourId,
      tourOwnerId,
      customerName,
      customerEmail,
      customerPhone,
      tourName,
      tourDate,
      guests: parseInt(guests),
      tourPrice: parseFloat(tourPrice),
      totalAmount: parseFloat(totalAmount),
      specialRequests: specialRequests || "",
      status: 'pending'
    });

    const savedReservation = await newReservation.save();
    console.log("Tour reservation created:", savedReservation._id);

    res.status(200).json({
      status: "Success",
      message: "Your tour has been booked successfully! Please wait for confirmation from the tour provider.",
      data: {
        reservation: savedReservation,
      },
    });
  } catch (err) {
    console.error("Error creating tour reservation:", err);
    res.status(400).json({
      status: "Unsuccess",
      message: err.message || "Error booking tour",
    });
  }
};

// Update reservation status (for tour owners)
const updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const reservation = await TourReservation.findById(id);

    if (!reservation) {
      return res.status(404).json({
        status: "unsuccess",
        message: "Reservation not found"
      });
    }

    // Update reservation status
    reservation.status = status;
    reservation.responseDate = new Date();
    
    if (status === 'cancelled' && rejectionReason) {
      reservation.rejectionReason = rejectionReason;
    }

    if (status === 'confirmed') {
      // Generate confirmation number if confirming
      if (!reservation.confirmationNumber) {
        reservation.confirmationNumber = `TR${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      }
    }

    const updatedReservation = await reservation.save();
    
    res.status(200).json({
      status: "success",
      message: `Tour reservation ${status} successfully`,
      data: {
        reservation: updatedReservation,
      },
    });
  } catch (err) {
    console.error("Error updating reservation status:", err);
    res.status(400).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

const getAllReservations = async (req, res) => {
  try {
    const allReservations = await TourReservation.find().sort({ createdAt: -1 });
    res.status(200).send(allReservations);
  } catch (err) {
    console.error("Error fetching reservations:", err);
    res.status(404).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

// Get reservations for a specific tour owner
const getOwnerReservations = async (req, res) => {
  try {
    const { tourOwnerId } = req.params;
    const reservations = await TourReservation.find({ tourOwnerId }).sort({ createdAt: -1 });
    res.status(200).json({
      status: "success",
      count: reservations.length,
      data: reservations
    });
  } catch (err) {
    console.error("Error fetching owner reservations:", err);
    res.status(400).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

// Get reservations for a specific customer
const getCustomerReservations = async (req, res) => {
  try {
    const { customerId } = req.params;
    const reservations = await TourReservation.find({ 
      $or: [
        { customerId },
        { customerEmail: customerId } // Also search by email for backward compatibility
      ]
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      status: "success",
      count: reservations.length,
      data: reservations
    });
  } catch (err) {
    console.error("Error fetching customer reservations:", err);
    res.status(400).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

const getReservation = async (req, res) => {
  try {
    const reservation = await TourReservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({
        status: "unsuccess",
        message: "Reservation not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: reservation
    });
  } catch (err) {
    console.error("Error fetching reservation:", err);
    res.status(400).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

const updateReservation = async (req, res) => {
  try {
    const updatedReservation = await TourReservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedReservation) {
      return res.status(404).json({
        status: "unsuccess",
        message: "Reservation not found",
      });
    }
    
    res.status(200).json({
      status: "success",
      message: "Tour reservation updated successfully",
      data: {
        reservation: updatedReservation,
      },
    });
  } catch (err) {
    console.error("Error updating reservation:", err);
    res.status(400).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

module.exports = { 
  bookTour, 
  getAllReservations, 
  getReservation, 
  updateReservation, 
  updateReservationStatus,
  getOwnerReservations,
  getCustomerReservations
};