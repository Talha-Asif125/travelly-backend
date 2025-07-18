const express = require("express");
// const { body } = require("express-validator"); // Temporarily disabled for quick access
const {
  submitContactMessage,
  getAllContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
  deleteContactMessage,
  getUnreadCount
} = require("../controllers/contactController");

const { verifyToken, verifyAdmin } = require("../middleware/verifyToken");
const { generalLimiter, contactLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// Validation middleware for contact form - TEMPORARILY DISABLED
/*
const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
  
  body('subject')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Subject cannot exceed 200 characters')
];
*/

// Public Routes
// @route   POST /api/contact
// @desc    Submit a contact message
// @access  Public
router.post(
  "/",
  contactLimiter, // Apply rate limiting for contact form
  // contactValidation, // Temporarily disabled
  submitContactMessage
);

// Admin Routes (require authentication and admin privileges)
// @route   GET /api/contact/admin
// @desc    Get all contact messages with pagination and filtering
// @access  Private (Admin only)
router.get(
  "/admin",
  verifyToken,
  verifyAdmin,
  getAllContactMessages
);

// @route   GET /api/contact/admin/unread-count
// @desc    Get unread contact messages count
// @access  Private (Admin only)
router.get(
  "/admin/unread-count",
  verifyToken,
  verifyAdmin,
  getUnreadCount
);

// @route   GET /api/contact/admin/:id
// @desc    Get a specific contact message by ID
// @access  Private (Admin only)
router.get(
  "/admin/:id",
  verifyToken,
  verifyAdmin,
  getContactMessageById
);

// @route   PUT /api/contact/admin/:id/status
// @desc    Update contact message status and add admin notes
// @access  Private (Admin only)
router.put(
  "/admin/:id/status",
  verifyToken,
  verifyAdmin,
  /*[
    body('status')
      .isIn(['new', 'read', 'replied', 'resolved'])
      .withMessage('Status must be one of: new, read, replied, resolved'),
    
    body('adminNotes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Admin notes cannot exceed 500 characters')
  ],*/
  updateContactMessageStatus
);

// @route   DELETE /api/contact/admin/:id
// @desc    Delete a contact message
// @access  Private (Admin only)
router.delete(
  "/admin/:id",
  verifyToken,
  verifyAdmin,
  deleteContactMessage
);

module.exports = router; 