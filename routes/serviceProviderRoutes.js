const express = require("express");
const {
  submitProviderRequest,
  getAllProviderRequests,
  getProviderRequestById,
  approveProviderRequest,
  rejectProviderRequest,
  getUserProviderRequests
} = require("../controllers/serviceProviderController");

const { verifyToken, verifyAdmin, protect } = require("../middleware/verifyToken");

const router = express.Router();

// Debug route to check database
router.get("/debug", async (req, res) => {
  try {
    const ServiceProviderRequest = require("../models/ServiceProviderRequest");
    const allRequests = await ServiceProviderRequest.find();
    res.json({
      success: true,
      count: allRequests.length,
      requests: allRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Debug route to make current user admin (REMOVE IN PRODUCTION!)
router.post("/make-admin", protect, async (req, res) => {
  try {
    const User = require("../models/userModel");
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { isAdmin: true },
      { new: true }
    );
    res.json({
      success: true,
      message: "User is now an admin",
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Debug route to migrate legacy provider types (REMOVE IN PRODUCTION!)
router.post("/migrate-legacy-providers", async (req, res) => {
  try {
    const User = require("../models/userModel");
    
    // Find all users with providerType but empty or missing providerTypes
    const usersToMigrate = await User.find({
      providerType: { $exists: true, $ne: null },
      $or: [
        { providerTypes: { $exists: false } },
        { providerTypes: { $size: 0 } },
        { providerTypes: null }
      ]
    });

    console.log(`Found ${usersToMigrate.length} users to migrate`);

    let migratedCount = 0;
    for (const user of usersToMigrate) {
      if (user.providerType) {
        user.providerTypes = [user.providerType];
        await user.save();
        migratedCount++;
        console.log(`Migrated user ${user.email}: ${user.providerType} -> [${user.providerType}]`);
      }
    }

    res.json({
      success: true,
      message: `Successfully migrated ${migratedCount} users`,
      migratedUsers: usersToMigrate.map(u => ({
        email: u.email,
        oldProviderType: u.providerType,
        newProviderTypes: u.providerTypes
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// User routes (protected) - Submit service provider request
router.post("/", protect, submitProviderRequest);
router.get("/user/:userId", protect, getUserProviderRequests);

// Admin routes (protected)
router.get("/", verifyAdmin, getAllProviderRequests);
router.get("/:id", verifyAdmin, getProviderRequestById);
router.post("/:id/approve", verifyAdmin, approveProviderRequest);
router.post("/:id/reject", verifyAdmin, rejectProviderRequest);

module.exports = router; 