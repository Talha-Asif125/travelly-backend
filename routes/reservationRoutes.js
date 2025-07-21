const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { 
  getCustomerReservations, 
  getProviderReservations, 
  updateReservationStatus,
  approveReservation, 
  rejectReservation 
} = require('../controllers/reservationController');

// Customer routes - for users to see their own reservations
router.get('/customer', verifyToken, getCustomerReservations);

// Provider routes - for service providers to see reservations for their services
router.get('/provider', verifyToken, getProviderReservations);

// Provider action routes - for service providers to approve/reject reservations
router.put('/provider/approve/:reservationId', verifyToken, approveReservation);
router.put('/provider/reject/:reservationId', verifyToken, rejectReservation);

// Status update route - for updating reservation status (used by frontend)
router.put('/:reservationId/status', verifyToken, updateReservationStatus);

module.exports = router;
