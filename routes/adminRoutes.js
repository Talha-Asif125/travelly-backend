const express = require("express");
const {
  getDashboardStats,
  getAllUsers,
  getAllServices,
  getAllReservations
} = require("../controllers/adminController");

const {
  getAllProviderRequests,
  getProviderRequestById,
  approveProviderRequest,
  rejectProviderRequest
} = require("../controllers/serviceProviderController");

const { protectAdmin } = require("../middleware/verifyToken");

const router = express.Router();

// All admin routes are protected
router.get("/stats", protectAdmin, getDashboardStats);
router.get("/users", protectAdmin, getAllUsers);
router.get("/services", protectAdmin, getAllServices);
router.get("/reservations", protectAdmin, getAllReservations);
router.get("/service-provider-requests", protectAdmin, getAllProviderRequests);
router.get("/service-provider-requests/:id", protectAdmin, getProviderRequestById);
router.post("/service-provider-requests/:id/approve", protectAdmin, approveProviderRequest);
router.post("/service-provider-requests/:id/reject", protectAdmin, rejectProviderRequest);

module.exports = router; 