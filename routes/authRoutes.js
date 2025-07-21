const express = require("express");
const {
  registerUser,
  verifyEmail,
  resendVerificationEmail,
  loginUser,
  logoutUser,
  forgotPasswordRequest,
  resetPassword,
  checkEmailExists,
  checkMobileExists,
  getCurrentUser,
  resetPasswordRequest, // For backward compatibility
  resetpasswordrequest, // For backward compatibility
  resetpassword, // For backward compatibility
} = require("../controllers/authController");
const { protect } = require("../middleware/verifyToken");

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// Password reset routes
router.post("/forgot-password", forgotPasswordRequest);
router.post("/reset-password", resetPassword);

// Backward compatibility routes
router.post("/reset-password-request", forgotPasswordRequest);
router.post("/resetpasswordrequest", forgotPasswordRequest);
router.post("/resetpassword", resetPassword);

// Validation routes
router.get("/check-email", checkEmailExists);
router.get("/check-mobile", checkMobileExists);

// Protected routes
router.get("/me", protect, getCurrentUser);

module.exports = router;
