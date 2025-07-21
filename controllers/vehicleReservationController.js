const Reservation = require("../models/VehicleReservation");
const Vehicle = require("../models/Vehicle");
const { v4: uuidv4 } = require("uuid");

exports.addReservation = async (req, res) => {
  //tested in postman - working well
  try {
    console.log('Creating vehicle reservation with data:', req.body);
    
    // Fetch vehicle details to calculate price
    const vehicle = await Vehicle.findById(req.body.vehicleId);

    if (!vehicle) {
      console.log('Vehicle not found for ID:', req.body.vehicleId);
      return res.status(404).json({ message: "Vehicle not found" });
    }

    console.log('Found vehicle:', vehicle);
    console.log('Vehicle owner (userId):', vehicle.userId);

    const numberOfDays =
      (new Date(req.body.returnDate) - new Date(req.body.pickupDate)) /
      (1000 * 3600 * 24); //convert milliseconds to days
    let amount = (numberOfDays) * vehicle.price; //add by 1 because if pickup date is 1st and return date is 3rd, it is 2 days.

    if (numberOfDays < 0) {
      return res.status(400).json({ message: "Invalid dates" });
    }

    if(req.body.needDriver){
      amount = amount + numberOfDays * 700000;   //static driver fee (PKR)
    }

    const newReservation = new Reservation({
      userId: req.body.userId,
      vehicleId: vehicle._id.toString(),
      vehicleNumber: vehicle.vehicleNumber,
      date: new Date(),
      location: vehicle.location,
      pickupDate: req.body.pickupDate,
      returnDate: req.body.returnDate,
      price: amount,
      needDriver : req.body.needDriver,
      vehicleOwnerId: vehicle.userId,
      transactionId: uuidv4(),
    });

    console.log('Creating reservation:', newReservation);
    
    await newReservation.save();
    
    console.log('Reservation saved successfully:', newReservation._id);
    
    res.status(200).json({
      success: true,
      message: "Vehicle reservation created successfully",
      data: newReservation
    });
  } catch (err) {
    console.error('Error creating vehicle reservation:', err);
    res.status(500).json({ 
      success: false,
      message: err.message || "Failed to create reservation"
    });
  }
};

// Update reservation status - for vehicle owners to accept/reject
exports.updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({ 
        success: false, 
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
        reservation.confirmationNumber = `VH${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      }
    }

    const updatedReservation = await reservation.save();
    
    res.status(200).json({
      success: true,
      message: `Reservation ${status} successfully`,
      data: updatedReservation
    });
  } catch (err) {
    console.error('Error updating reservation status:', err);
    res.status(500).json({ 
      success: false,
      message: err.message || "Failed to update reservation status"
    });
  }
};

//get my all reservations - traveler                               //postman tested working well.
exports.getMyReservationsTraveler = async (req, res) => {
  try {
    const { userId } = req.params;
    const reservations = await Reservation.find({ userId: userId });
    res.send(reservations);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

//get my all reservations - owner                               //postman tested working well.
exports.getMyReservationsOwner = async (req, res) => {
  try {
    const { vehicleOwnerId } = req.params;
    const reservations = await Reservation.find({
      vehicleOwnerId: vehicleOwnerId,
    });
    res.send(reservations);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

//get a specific reservation - traveler                                 //postman tested working well.
exports.getOneReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findOne({ _id: id });
    res.send(reservation);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

//delete/cancel a reservation   - traveler and vehicle owner     //postman tested working well.
exports.deleteReservation = async (req, res) => {
  const { id } = req.params;

  try {
    const reservation = await Reservation.findByIdAndDelete(id);
    if (!reservation) {
      res.status(404).send("Reservation not found");
    } else {
      res.send(reservation);
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

//get All reservations
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find();
    res.send(reservations);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

//get reservations - traveler by vehicle id                 //postman tested working well.
exports.getMyReservationsTravelerByVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const reservations = await Reservation.find({ vehicleId: vehicleId });
    res.send(reservations);
  } catch (err) {
    res.status(500).send(err.message);
  }
}