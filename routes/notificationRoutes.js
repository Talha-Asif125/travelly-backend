const express = require("express");
const {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require("../controllers/notificationController");

const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// GET /api/notifications - Get user's notifications
router.get("/", getNotifications);

// POST /api/notifications - Create a new notification (admin only)
router.post("/", createNotification);

// POST /api/notifications/:id/read - Mark notification as read
router.post("/:id/read", markAsRead);

// POST /api/notifications/mark-all-read - Mark all notifications as read
router.post("/mark-all-read", markAllAsRead);

// DELETE /api/notifications/:id - Delete a notification
router.delete("/:id", deleteNotification);

module.exports = router; 