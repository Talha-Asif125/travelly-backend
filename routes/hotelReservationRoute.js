const express=require("express");
const Hotel = require("../models/hotelReservationModel");
const {
    reservation, getAllReservation, updateReservation
  } = require("../controllers/hotelReservation.js");

  const router =express.Router();
  //Create
  router.post("/reservation",reservation)
  router.get("/getAll",getAllReservation)
  router.put("/:id", updateReservation)
  router.patch("/:id", updateReservation)


module.exports = router;
   