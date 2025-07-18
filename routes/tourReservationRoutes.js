const express = require("express");
const router = express.Router();
const tourReservationController = require("../controllers/tourReservstionController");

// Tour booking routes
router
  .route("/")
  .get(tourReservationController.getAllReservations)
  .post(tourReservationController.bookTour);

// Update reservation status (for owners)
router
  .route("/:id/status")
  .patch(tourReservationController.updateReservationStatus);

// Get reservations for a specific tour owner
router
  .route("/owner/:tourOwnerId")
  .get(tourReservationController.getOwnerReservations);

// Get reservations for a specific customer
router
  .route("/customer/:customerId")
  .get(tourReservationController.getCustomerReservations);

// Individual reservation routes
router
  .route("/:id")
  .get(tourReservationController.getReservation)
  .patch(tourReservationController.updateReservation);

module.exports = router; 