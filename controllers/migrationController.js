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

// Note: Sample data creation functions removed to work only with real MongoDB data

module.exports = {
  migrateTrainsToServices,
  getTrainServices,
  getFlightServices
}; 