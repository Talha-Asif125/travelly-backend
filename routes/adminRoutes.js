const express = require("express");
const {
  getDashboardStats,
  getAllUsers,
  getAllServices,
  getAllReservations,
  changeUserPassword,
  updateUser,
  deleteUser,
  createService,
  updateService,
  deleteService,
  getChatNotifications,
  markChatMessagesAsRead,
  getContactMessages,
  updateContactMessageStatus,
  toggleUserVerification,
  deleteReservation
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
router.use(protectAdmin);

// Dashboard & Statistics
router.get("/stats", getDashboardStats);

// User Management
router.get("/users", getAllUsers);
router.put("/users/:userId", updateUser);
router.delete("/users/:userId", deleteUser);
router.put("/users/:userId/password", changeUserPassword);

// Service Management
router.get("/services", getAllServices);
router.post("/services", createService);
router.put("/services/:serviceId", updateService);
router.delete("/services/:serviceId", deleteService);

// Reservation Management
router.get("/reservations", getAllReservations);
router.delete("/reservations/:reservationId", deleteReservation);

// Provider Request Management
router.get("/service-provider-requests", getAllProviderRequests);
router.get("/service-provider-requests/:id", getProviderRequestById);
router.post("/service-provider-requests/:id/approve", approveProviderRequest);
router.post("/service-provider-requests/:id/reject", rejectProviderRequest);

// Chat & Notifications
router.get("/chat/notifications", getChatNotifications);
router.post("/chat/:chatId/mark-read", markChatMessagesAsRead);

// Contact Message Management
router.get("/contact-messages", getContactMessages);
router.put("/contact-messages/:messageId", updateContactMessageStatus);

// User verification
router.patch("/users/:userId/verification", toggleUserVerification);

module.exports = router; 