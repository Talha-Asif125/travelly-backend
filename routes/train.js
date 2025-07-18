const router = require("express").Router();
const trainCtrl = require("../controllers/trainCtrl");
const { verifyToken, adminMiddleware } = require("../middleware/authMiddleware");

// Admin routes
router.route("/add").post(verifyToken, adminMiddleware, trainCtrl.addTrain);    // add train - admin
router.route("/update/:id").put(verifyToken, adminMiddleware, trainCtrl.updateTrain);  // edit train - admin
router.route("/delete/:id").delete(verifyToken, adminMiddleware, trainCtrl.deleteTrain);   // delete train

// Public routes
router.route("/").get(trainCtrl.getAllTrains);   // view all trains - admin and touris
router.route("/get/:id").get(trainCtrl.getSingleTrain);    // view only one train -admin and tourist
router.route("/fetch/:from/:to").get(trainCtrl.getTrainFromTo);     // sort according to from and to

module.exports = router;