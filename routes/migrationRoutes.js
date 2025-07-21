const express = require("express");
const {
  migrateTrainsToServices,
  getTrainServices,
  getFlightServices
} = require("../controllers/migrationController");

const { protect, protectAdmin } = require("../middleware/verifyToken");

const router = express.Router();

// Migration routes (admin only)
router.post('/migrate/trains', protectAdmin, migrateTrainsToServices);

// Unified service routes for trains and flights
router.get('/trains', getTrainServices);     // GET /api/migration/trains
router.get('/flights', getFlightServices);   // GET /api/migration/flights

module.exports = router; 