const express = require("express");
const {
  createReservation,
  getProviderReservations,
  updateReservationStatus,
  getCustomerReservations,
  getReservationDetails
} = require("../controllers/serviceReservationController");

const { protect } = require("../middleware/verifyToken");

const router = express.Router();

// All routes require authentication
router.use(protect);

// Customer routes
router.post('/', createReservation);                    // POST /api/reservations
router.get('/my-bookings', getCustomerReservations);    // GET /api/reservations/my-bookings

// Provider routes  
router.get('/provider', getProviderReservations);       // GET /api/reservations/provider
router.put('/:id/status', updateReservationStatus);     // PUT /api/reservations/:id/status

// Shared routes
router.get('/:id', getReservationDetails);              // GET /api/reservations/:id

module.exports = router; 