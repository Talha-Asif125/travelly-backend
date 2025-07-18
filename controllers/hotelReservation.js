const hotelReservation = require("../models/hotelReservationModel");

// Create a new reservation
const reservation = async (req, res, next) => {
    const {
        hotelName,
        checkInDate,
        checkOutDate,
        userName,
        totalPrice,
        totalDays
    } = req.body;

    // Validate required fields
    if (!hotelName || !checkInDate || !checkOutDate || !userName || !totalPrice || !totalDays) {
        return res.status(400).json({ message: "All fields are required." });
    }

    // Validate that checkInDate is before checkOutDate
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
        return res.status(400).json({ message: "Check-in date must be before check-out date." });
    }

    try {
        const newReservation = new hotelReservation({
            hotelName,
            checkInDate,
            checkOutDate,
            userName,
            totalPrice,
            totalDays
        });

        const savedReservation = await newReservation.save();
        res.status(200).json(savedReservation);
    } catch (err) {
        next(err);
    }
};

// Get all reservations with optional limit
const getAllReservation = async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10; // Default to 10 if no limit is provided

    try {
        const hotels = await hotelReservation.find().limit(limit);
        res.status(200).json(hotels);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Update reservation status
const updateReservation = async (req, res, next) => {
    try {
        const updatedReservation = await hotelReservation.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        
        if (!updatedReservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }
        
        res.status(200).json(updatedReservation);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    reservation,
    getAllReservation,
    updateReservation
};
