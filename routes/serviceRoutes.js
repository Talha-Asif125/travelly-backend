const express = require("express");
const {
  getServices,
  getServiceById,
  getHotelDetails,
  getServicesByType,
  createService,
  updateService,
  deleteService
} = require("../controllers/serviceController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getServices);                    // GET /api/services - get all services with filters
router.get('/hotel/:id', getHotelDetails);      // GET /api/services/hotel/:id - comprehensive hotel details
router.get('/details/:id', getServiceById);     // GET /api/services/details/:id - get service by ID
router.get('/:type', getServicesByType);        // GET /api/services/hotel, /api/services/tour, etc.

// Protected routes (require authentication)
router.use(authenticate);
router.post('/', createService);                // POST /api/services - create new service
router.put('/:id', updateService);              // PUT /api/services/:id - update service
router.delete('/:id', deleteService);           // DELETE /api/services/:id - delete service

module.exports = router; 