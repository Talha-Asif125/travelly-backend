const express = require("express");
const {
  getProviderServices,
  createService,
  updateService,
  deleteService,
  getServiceById,
  getUserProviderStatus,
  repairProviderData
} = require("../controllers/providerServiceController");

const { protect } = require("../middleware/verifyToken");

const router = express.Router();

// All routes require authentication and provider status
router.use(protect);

// Routes for /api/provider/services
router.route('/')
  .get(getProviderServices)  // GET /api/provider/services
  .post(createService);      // POST /api/provider/services

// Route for getting user's provider status
router.get('/status/me', getUserProviderStatus); // GET /api/provider/services/status/me

// Route for repairing provider data inconsistencies
router.post('/repair', repairProviderData);

router.route('/:id')
  .get(getServiceById)       // GET /api/provider/services/:id
  .put(updateService)        // PUT /api/provider/services/:id
  .delete(deleteService);    // DELETE /api/provider/services/:id

module.exports = router; 