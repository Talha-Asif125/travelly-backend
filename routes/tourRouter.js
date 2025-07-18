const express = require("express");
const tourController = require("../controllers/tourController");
const tourCustomForm = require("../controllers/tourCustomFormController");
const tourReservationController = require("../controllers/tourReservstionController");

//define route handler
const router = express.Router();

//tour routes
router
  .route("/")
  .post(tourController.createTour)
  .get(tourController.getAllTours);

// Tours by category route
router
  .route("/category/:category")
  .get(tourController.getToursByCategory);

// Tour reservation routes
router
  .route("/reservations")
  .get(tourReservationController.getAllReservations)
  .post(tourReservationController.bookTour);

// Update reservation status (for owners)
router
  .route("/reservations/:id/status")
  .patch(tourReservationController.updateReservationStatus);

// Get reservations for a specific tour owner
router
  .route("/reservations/owner/:tourOwnerId")
  .get(tourReservationController.getOwnerReservations);

// Get reservations for a specific customer
router
  .route("/reservations/customer/:customerId")
  .get(tourReservationController.getCustomerReservations);

// Individual reservation routes
router
  .route("/reservations/:id")
  .get(tourReservationController.getReservation)
  .patch(tourReservationController.updateReservation);

// Tour by ID routes - must be after specific routes to avoid conflict with :id
router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

//custom form
router.route("/customform").post(tourCustomForm.createForm);

module.exports = router;
