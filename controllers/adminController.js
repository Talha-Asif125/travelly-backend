const ServiceProviderRequest = require("../models/ServiceProviderRequest");
const User = require("../models/userModel");

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();

    // Get pending service provider requests
    const pendingRequests = await ServiceProviderRequest.countDocuments({ status: 'pending' });

    // Get active service providers
    const activeProviders = await User.countDocuments({ type: 'provider' });

    // Mock data for reservations (implement when reservation models are available)
    const totalReservations = 0; // This would be calculated from actual reservation models

    const stats = {
      totalUsers,
      pendingRequests,
      activeProviders,
      totalReservations
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get all services (Admin only) - Mock for now
const getAllServices = async (req, res) => {
  try {
    // This would be implemented when service models are available
    const mockServices = [
      {
        id: 1,
        name: "Sample Hotel",
        type: "hotel",
        providerName: "John Doe",
        price: 100,
        status: "active"
      },
      {
        id: 2,
        name: "City Tour",
        type: "tour",
        providerName: "Jane Smith",
        price: 50,
        status: "active"
      }
    ];

    res.status(200).json({
      success: true,
      count: mockServices.length,
      data: mockServices
    });

  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get all reservations (Admin only) - Mock for now
const getAllReservations = async (req, res) => {
  try {
    // This would be implemented when reservation models are available
    const mockReservations = [
      {
        id: 1,
        customerName: "Alice Johnson",
        serviceName: "Sample Hotel",
        date: "2024-01-15",
        amount: 100,
        status: "approved"
      },
      {
        id: 2,
        customerName: "Bob Williams",
        serviceName: "City Tour",
        date: "2024-01-20",
        amount: 50,
        status: "pending"
      }
    ];

    res.status(200).json({
      success: true,
      count: mockReservations.length,
      data: mockReservations
    });

  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllServices,
  getAllReservations
}; 