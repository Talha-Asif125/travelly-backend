const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  resetPasswordRequest,
  resetPassword,
  checkEmailExists,
  checkMobileExists,
  getCurrentUser,
  // Backward compatibility
  resetpasswordrequest,
  resetpassword,
} = require("../controllers/authController");

const { authenticate } = require("../middleware/auth");
const { 
  authLimiter, 
  passwordResetLimiter, 
  registrationLimiter 
} = require("../middleware/rateLimiter");

// Public routes with rate limiting
router.post("/register", registrationLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.get("/check-email", checkEmailExists);
router.get("/check-mobile", checkMobileExists);

// Password reset routes with strict rate limiting
router.post("/reset-password-request", passwordResetLimiter, resetPasswordRequest);
router.post("/reset-password", passwordResetLimiter, resetPassword);

// Backward compatibility routes (deprecated) with rate limiting
router.post("/forgot-password", passwordResetLimiter, resetpasswordrequest);
router.post("/reset-password-old", passwordResetLimiter, resetpassword);

// Protected routes
router.use(authenticate); // All routes below require authentication
router.post("/logout", logoutUser);
router.get("/me", getCurrentUser);

module.exports = router;
