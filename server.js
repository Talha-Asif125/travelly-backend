const cookieParser = require("cookie-parser");
const express = require("express");
const dotenv = require("dotenv").config();
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const chatRoutes = require("./routes/chatRoutes");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const cors = require("cors");

// Import new middleware
const { globalErrorHandler, notFoundHandler } = require("./middleware/errorHandler");
const { generalLimiter } = require("./middleware/rateLimiter");
const ApiResponse = require("./utils/ApiResponse");

//db connection
const connectDB = require("./config/db");
connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Apply general rate limiting to all API routes
app.use('/api/', generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Configure CORS to accept requests from frontend
const corsOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://travelly-six.vercel.app'] 
  : ['https://travelly-six.vercel.app'];

app.use(cors({
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

//calling the routes
//isuru
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// Community Routes
const communityRoutes = require("./routes/communityRoutes");
app.use("/api/community", communityRoutes);
app.use('/api/community/images', express.static(path.join(__dirname, 'images/community')));

// Notification Routes
const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

// Service Provider and Admin Routes
const serviceProviderRoutes = require("./routes/serviceProviderRoutes");
const providerServiceRoutes = require("./routes/providerServiceRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/service-provider-requests", serviceProviderRoutes);
app.use("/api/provider/services", providerServiceRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/admin", adminRoutes);

// Contact form routes
const contactRoutes = require("./routes/contactRoutes");
app.use("/api/contact", contactRoutes);

//ishara
const tourRouter = require("./routes/tourRouter");
app.use("/api/tours", tourRouter);

//yasiru
const vehicleRouter = require("./routes/vehicles");
const reservationRouter = require("./routes/vehicleReservations");

app.use("/api/vehicle", vehicleRouter);
app.use("/api/vehicle/images", express.static(path.join(__dirname, "images")));
app.use("/api/vehiclereservation", reservationRouter);

//chamith
const hotels = require('./routes/hotels');
const rooms = require('./routes/rooms');
const hotelreservation = require('./routes/hotelReservationRoute');

app.use('/api/hotels', hotels);
app.use('/api/rooms', rooms);
app.use('/api/hotelreservation',hotelreservation)
app.use('/api/hotels/images', express.static(path.join(__dirname, 'images')));

//navindi
const restaurantRoute = require("./routes/restaurantRoute.js");
const restaurantTypeRoute = require("./routes/restaurantTypeRoute");
const restaurantDistrictRoute = require("./routes/restaurantDistrictRoute");
const restaurantReservationTimeRoute = require("./routes/restaurantReservationTimeRoute");
const restaurantRateRoute = require("./routes/restaurantRateRoute");
const restaurantReservationRoute = require("./routes/restaurantReservationRoute");

app.use("/api/restaurant", restaurantRoute);
app.use("/api/restaurantType", restaurantTypeRoute);
app.use("/api/restaurantDistrict", restaurantDistrictRoute);
app.use("/api/restaurantReservationTime", restaurantReservationTimeRoute);
app.use("/api/restaurantRate", restaurantRateRoute);
app.use("/api/restaurantReservation", restaurantReservationRoute);

// sehan
const trainRouter = require("./routes/train");
app.use("/api/train", trainRouter);
app.use("/api/train/images", express.static(path.join(__dirname, "images/train")));

const seatBookingRouter = require("./routes/SeatBookings");
app.use("/api/seatBookings", seatBookingRouter);

const flightBookingRouter = require("./routes/SeatBookingFlight");
app.use("/api/flight", flightBookingRouter);


// dinidu
const refundRouter = require("./routes/RefundRoute")
app.use("/api/refund",refundRouter)

const EmployeeRouter = require("./routes/EmployeeRoute")
app.use("/api/employee",EmployeeRouter)

const SalaryRouter = require("./routes/SalaryRoute")
app.use("/api/salary",SalaryRouter)

const RecordRouter = require("./routes/FinanceHealth")
app.use("/api/record",RecordRouter)


//hansika
const ActivityRoute = require("./routes/activityRoute");
const ReservationRoute = require("./routes/reservationRoute.js");

app.use("/api/activities", ActivityRoute);
app.use("/api/activity-reservations", ReservationRoute);

// Event Management Routes
const eventRoutes = require("./routes/eventRoutes");
app.use("/api/events", eventRoutes);

// Migration and unified transport routes
const migrationRoutes = require("./routes/migrationRoutes");
app.use("/api/migration", migrationRoutes);

app.get("/", (req, res) => {
  res.send("API is Running Succesfully");
});

/*app.get('/api/chat',(req,res) => {
    res.send(chats);
});*/

app.use("/api/message", messageRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

/*app.get('/api/chat/:id',(req,res) =>{
    //console.log(req.params.id);
    const singleChat =chats.find((c) =>c._id ===req.params.id);
    res.send(singleChat);
});*/

// Global error handlers (must be last)
app.use(notFoundHandler);
app.use(globalErrorHandler);

//define the port number
const port = process.env.PORT || 5000;

//start the server
const server = app.listen(port, () =>
  console.log(`🚀 Server running on port ${port}`.green.bold)
);

// Socket.io setup
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: corsOrigins,
    methods: ["GET", "POST"]
  },
});

io.on("connection", (socket) => {
  console.log("✅ Connected to socket.io".cyan);
  
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

process.on('unhandledRejection', (err, promise) => {
  console.log('🔥 Unhandled Promise Rejection: ', err.message);
  server.close(() => {
    process.exit(1);
  });
});

