const express=require("express");
const Hotel = require("../models/Hotel.js");

const {
    createHotel,
    updateHotel,
    deleteHotel,
    getHotel,
    getAllHotel,
    countByCity,
    countByType,
    getHotelbyCity,
    getHotelRooms

  } = require("../controllers/hotel.js");



const router =express.Router();

// Remove the old CORS middleware
// router.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   
//   if (req.method === 'OPTIONS') {
//     return res.status(200).end();
//   }
//   
//   next();
// });

//Create
router.post("/",createHotel)

//Update
router.put("/:id",updateHotel)

//Delete

router.delete("/:id",deleteHotel)

//get
router.get("/find/:id", getHotel)

// Get all hotels
router.get("/",getAllHotel)

router.get("/count-by-city",countByCity)
router.get("/count-by-type",countByType)

router.get("/get/:city",getHotelbyCity)

router.get("/room/:id",getHotelRooms);

module.exports = router;    