const express = require("express");
const {
  migrateTrainsToServices,
  getTrainServices,
  getFlightServices,
  createSampleTrainServices
} = require("../controllers/migrationController");

const { protect, protectAdmin } = require("../middleware/verifyToken");

const router = express.Router();

// Migration routes (admin only)
router.post('/migrate/trains', protectAdmin, migrateTrainsToServices);

// Development route for creating sample data (remove in production)
router.post('/samples/transport', createSampleTrainServices);

// Unified service routes for trains and flights
router.get('/trains', getTrainServices);     // GET /api/migration/trains
router.get('/flights', getFlightServices);   // GET /api/migration/flights

module.exports = router; 