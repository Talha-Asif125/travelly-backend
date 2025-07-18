const Service = require("../models/Service");
const Train = require("../models/Train");
const User = require("../models/userModel");

// Migration function to convert existing trains to services
const migrateTrainsToServices = async (req, res) => {
  try {
    // Find a default admin/provider user for migration
    const defaultProvider = await User.findOne({ isAdmin: true }) || await User.findOne();
    
    if (!defaultProvider) {
      return res.status(400).json({
        success: false,
        message: "No user found to assign as provider. Please create a user first."
      });
    }

    // Get all existing trains
    const trains = await Train.find();
    const migratedServices = [];
    
    for (const train of trains) {
      // Check if this train is already migrated
      const existingService = await Service.findOne({
        type: 'train',
        trainNumber: train.trainName,
        from: train.from,
        to: train.to
      });
      
      if (existingService) {
        console.log(`Train ${train.trainName} already migrated, skipping...`);
        continue;
      }
      
      // Create new service from train data
      const serviceData = {
        providerId: defaultProvider._id,
        name: train.trainName || `Train Service`,
        description: train.description || `Train service from ${train.from} to ${train.to}`,
        type: 'train',
        price: parseFloat(train.price) || 0,
        
        // Train specific fields
        from: train.from,
        to: train.to,
        arrivalTime: train.arrivalTime,
        departureTime: train.depatureTime, // Note: typo in original model
        trainNumber: train.trainName,
        classType: train.classType,
        maxBaggage: train.MaxBagage, // Note: typo in original model
        cancelCharges: train.cancelCharges,
        availableSeats: train.noOfSeats || 0,
        scheduleDate: train.date,
        
        // Additional fields
        images: train.trainMainImg ? [train.trainMainImg] : [],
        status: 'active'
      };
      
      const newService = new Service(serviceData);
      await newService.save();
      migratedServices.push(newService);
    }
    
    res.status(200).json({
      success: true,
      message: `Successfully migrated ${migratedServices.length} trains to services`,
      migratedCount: migratedServices.length,
      totalTrains: trains.length,
      data: migratedServices
    });
    
  } catch (error) {
    console.error("Error migrating trains:", error);
    res.status(500).json({
      success: false,
      message: "Error migrating trains to services",
      error: error.message
    });
  }
};

// Function to get trains as services (for backward compatibility)
const getTrainServices = async (req, res) => {
  try {
    const { from, to } = req.query;
    
    let filter = { type: 'train', status: 'active' };
    
    if (from && to) {
      filter.from = from;
      filter.to = to;
    }
    
    const trainServices = await Service.find(filter)
      .populate('providerId', 'name email businessName')
      .sort({ departureTime: 1 });
    
    res.status(200).json({
      success: true,
      count: trainServices.length,
      data: trainServices
    });
    
  } catch (error) {
    console.error("Error fetching train services:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching train services",
      error: error.message
    });
  }
};

// Function to get flights as services
const getFlightServices = async (req, res) => {
  try {
    const { from, to } = req.query;
    
    let filter = { type: 'flight', status: 'active' };
    
    if (from && to) {
      filter.from = from;
      filter.to = to;
    }
    
    const flightServices = await Service.find(filter)
      .populate('providerId', 'name email businessName')
      .sort({ departureTime: 1 });
    
    res.status(200).json({
      success: true,
      count: flightServices.length,
      data: flightServices
    });
    
  } catch (error) {
    console.error("Error fetching flight services:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching flight services",
      error: error.message
    });
  }
};

// Helper function to create sample train services
const createSampleTrainServices = async (req, res) => {
  try {
    const defaultProvider = await User.findOne({ isAdmin: true }) || await User.findOne();
    
    if (!defaultProvider) {
      return res.status(400).json({
        success: false,
        message: "No user found to assign as provider."
      });
    }

    const sampleTrains = [
      {
        name: "Express Train - Colombo to Kandy",
        description: "Fast and comfortable express train service from Colombo to Kandy with scenic mountain views",
        type: "train",
        price: 1500,
        from: "Colombo",
        to: "Kandy",
        departureTime: "08:00",
        arrivalTime: "11:30",
        trainNumber: "EXP001",
        classType: "First Class",
        availableSeats: 120,
        scheduleDate: "2024-01-01",
        maxBaggage: "20kg",
        cancelCharges: "Rs. 150",
        amenities: "AC, WiFi, Meals",
        providerId: defaultProvider._id,
        status: "active"
      },
      {
        name: "Night Mail - Colombo to Jaffna",
        description: "Overnight train service connecting the capital to the northern province",
        type: "train",
        price: 2500,
        from: "Colombo",
        to: "Jaffna",
        departureTime: "22:00",
        arrivalTime: "06:00",
        trainNumber: "NM002",
        classType: "Sleeper",
        availableSeats: 80,
        scheduleDate: "2024-01-01",
        maxBaggage: "25kg",
        cancelCharges: "Rs. 250",
        amenities: "Sleeping berths, Meals, AC",
        providerId: defaultProvider._id,
        status: "active"
      }
    ];

    const sampleFlights = [
      {
        name: "SriLankan Airlines - Colombo to Dubai",
        description: "International flight service to Dubai with excellent amenities",
        type: "flight",
        price: 45000,
        from: "Colombo (CMB)",
        to: "Dubai (DXB)",
        departureTime: "15:30",
        arrivalTime: "19:45",
        flightNumber: "UL225",
        airline: "SriLankan Airlines",
        availableSeats: 250,
        scheduleDate: "2024-01-01",
        aircraftType: "Airbus A330",
        providerId: defaultProvider._id,
        status: "active"
      },
      {
        name: "FitsAir - Colombo to Chennai",
        description: "Regional flight service to Chennai, India",
        type: "flight",
        price: 15000,
        from: "Colombo (CMB)",
        to: "Chennai (MAA)",
        departureTime: "10:15",
        arrivalTime: "11:45",
        flightNumber: "FZ1421",
        airline: "FitsAir",
        availableSeats: 180,
        scheduleDate: "2024-01-01",
        aircraftType: "Boeing 737",
        providerId: defaultProvider._id,
        status: "active"
      }
    ];

    const allSamples = [...sampleTrains, ...sampleFlights];
    const createdServices = [];

    for (const sampleData of allSamples) {
      const service = new Service(sampleData);
      await service.save();
      createdServices.push(service);
    }

    res.status(201).json({
      success: true,
      message: `Created ${createdServices.length} sample train and flight services`,
      data: createdServices
    });

  } catch (error) {
    console.error("Error creating sample services:", error);
    res.status(500).json({
      success: false,
      message: "Error creating sample services",
      error: error.message
    });
  }
};

module.exports = {
  migrateTrainsToServices,
  getTrainServices,
  getFlightServices,
  createSampleTrainServices
}; 