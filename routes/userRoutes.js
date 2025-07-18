const express = require("express");
const {
  updateUser,
  deleteUser,
  getUser,
  getAllUsers,
} = require("../controllers/userController");
const {
  verifyToken,
  verifyUser,
  verifyAdmin,
} = require("../middleware/verifyToken");

const {
  registerUser,
  allUsers,
  authUser,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/verifyToken");

const router = express.Router();

router.get("/checkauthentication", verifyToken, (req, res, next) => {
  res.status(200).json({ message: "Authenticated" });
});

router.get("/checkuser/:id", verifyUser, (req, res, next) => {
  res
    .status(200)
    .json({ message: "Hello user,You are logged in you can do this" });
});

router.get("/checkadmin/:id", verifyAdmin, (req, res, next) => {
  res
    .status(200)
    .json({ message: "Hello admin,You are logged in you can do this" });
});

// Unprotected routes for debugging
router.get("/all", getAllUsers);
router.get("/all/:id", getUser);
router.delete("/delete/:id", deleteUser);
router.put("/update/:id", updateUser);

//update
router.put("/:id", verifyUser, updateUser);
//delete
router.delete("/:id", verifyUser, deleteUser);
//get
router.get("/:id", verifyUser, getUser);
//get all
router.get("/", verifyAdmin, getAllUsers);

router.route("/").post(registerUser);

//search api
router.route("/").get(protect, allUsers);

router.route("/login").post(authUser);

module.exports = router;
