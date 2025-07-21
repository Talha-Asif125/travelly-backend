const ServiceProviderRequest = require("../models/ServiceProviderRequest");
const User = require("../models/userModel");
const Service = require("../models/Service");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const Notification = require("../models/Notification");
const ContactMessage = require("../models/ContactMessage");
const ServiceReservation = require("../models/ServiceReservation");
const bcrypt = require("bcryptjs");

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();

    // Get pending service provider requests
    const pendingRequests = await ServiceProviderRequest.countDocuments({ status: 'pending' });

    // Get active service providers
    const activeProviders = await User.countDocuments({ type: 'provider' });

    // Get total services
    const totalServices = await Service.countDocuments();

    // Get total reservations
    const totalReservations = await ServiceReservation.countDocuments();

    // Get unread chat messages (new messages not seen by admin)
    const unreadMessages = await Message.countDocuments({ 
      read: false,
      sender: { $ne: req.user._id }
    });

    // Get contact messages
    const unreadContactMessages = await ContactMessage.countDocuments({ status: 'new' });

    const stats = {
      totalUsers,
      pendingRequests,
      activeProviders,
      totalServices,
      totalReservations,
      unreadMessages,
      unreadContactMessages
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

// Get all users with enhanced details
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', userType = '' } = req.query;
    
    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }
    if (userType) {
      filter.type = userType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
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

// Get all services with enhanced details
const getAllServices = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', serviceType = '', status = '' } = req.query;
    
    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (serviceType) {
      filter.type = serviceType;
    }
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const services = await Service.find(filter)
      .populate('providerId', 'name email businessName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Service.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: services.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: services
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

// Get all reservations from all types
const getAllReservations = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '', type = '' } = req.query;
    
    // Import all reservation models
    const TourReservation = require('../models/tourBook');
    const VehicleReservation = require('../models/VehicleReservation');
    const ResturentReservation = require('../models/resturentReservationModel');
    
    // Build filters for each type
    const serviceFilter = status ? { status } : {};
    const tourFilter = status ? { status } : {};
    const vehicleFilter = status ? { status } : {};
    const restaurantFilter = status ? { status } : {};
    
    // Fetch all types of reservations
    const [serviceReservations, tourReservations, vehicleReservations, restaurantReservations] = await Promise.all([
      ServiceReservation.find(serviceFilter)
        .populate('serviceId', 'name type')
        .populate('providerId', 'name businessName')
        .populate('customerId', 'name email'),
      TourReservation.find(tourFilter),
      VehicleReservation.find(vehicleFilter),
      ResturentReservation.find(restaurantFilter)
        .populate('resturent', 'name')
        .populate('user', 'name email')
    ]);

    // Combine and format all reservations
    const allReservations = [
      ...serviceReservations.map(r => ({
        ...r.toObject(),
        type: 'service',
        reservationType: 'Service Reservation'
      })),
      ...tourReservations.map(r => ({
        ...r.toObject(),
        type: 'tour',
        reservationType: 'Tour Booking',
        customerName: r.customerName,
        customerEmail: r.customerEmail
      })),
      ...vehicleReservations.map(r => ({
        ...r.toObject(),
        type: 'vehicle',
        reservationType: 'Vehicle Rental',
        customerName: r.userId, // Vehicle reservations use userId as string
        customerEmail: r.userId
      })),
      ...restaurantReservations.map(r => ({
        ...r.toObject(),
        type: 'restaurant',
        reservationType: 'Restaurant Booking',
        customerName: r.user?.name || 'N/A',
        customerEmail: r.user?.email || 'N/A'
      }))
    ];

    // Filter by type if specified
    let filteredReservations = allReservations;
    if (type) {
      filteredReservations = allReservations.filter(r => r.type === type);
    }

    // Sort by creation date (newest first)
    filteredReservations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const total = filteredReservations.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedReservations = filteredReservations.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      count: paginatedReservations.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: paginatedReservations
    });

  } catch (error) {
    console.error("Error fetching all reservations:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Change user password
const changeUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {
    console.error("Error changing user password:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Update user details
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated this way
    delete updateData.password;
    delete updateData._id;
    delete updateData.__v;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user
    });

  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Create service (Admin)
const createService = async (req, res) => {
  try {
    const serviceData = {
      ...req.body,
      images: req.body.images || [],
      status: 'active' // Admin created services are automatically active
    };

    const service = new Service(serviceData);
    await service.save();

    await service.populate('providerId', 'name email businessName');

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: service
    });

  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Update service
const updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const updateData = req.body;

    // Remove sensitive fields
    delete updateData._id;
    delete updateData.__v;

    const service = await Service.findByIdAndUpdate(
      serviceId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('providerId', 'name email businessName');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: service
    });

  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Delete service
const deleteService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const service = await Service.findByIdAndDelete(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Service deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get chat notifications (unread messages)
const getChatNotifications = async (req, res) => {
  try {
    // Get all chats with unread messages
    const chatsWithUnreadMessages = await Chat.find({
      users: { $ne: req.user._id }, // Chats not involving admin
      latestMessage: { $exists: true }
    })
    .populate('users', 'name email pic')
    .populate('latestMessage')
    .sort({ updatedAt: -1 });

    // Get unread message count for each chat
    const chatNotifications = await Promise.all(
      chatsWithUnreadMessages.map(async (chat) => {
        const unreadCount = await Message.countDocuments({
          chat: chat._id,
          sender: { $ne: req.user._id },
          read: false
        });

        if (unreadCount > 0) {
          return {
            chatId: chat._id,
            users: chat.users,
            latestMessage: chat.latestMessage,
            unreadCount,
            updatedAt: chat.updatedAt
          };
        }
        return null;
      })
    );

    // Filter out null values
    const validNotifications = chatNotifications.filter(notification => notification !== null);

    res.status(200).json({
      success: true,
      count: validNotifications.length,
      data: validNotifications
    });

  } catch (error) {
    console.error("Error fetching chat notifications:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Mark chat messages as read
const markChatMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;

    await Message.updateMany(
      { 
        chat: chatId, 
        sender: { $ne: req.user._id },
        read: false 
      },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: "Messages marked as read"
    });

  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get contact messages
const getContactMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;
    
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await ContactMessage.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ContactMessage.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: messages
    });

  } catch (error) {
    console.error("Error fetching contact messages:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Update contact message status
const updateContactMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status, adminNotes } = req.body;

    const contactMessage = await ContactMessage.findByIdAndUpdate(
      messageId,
      { 
        status, 
        adminNotes: adminNotes || undefined
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact message updated successfully",
      data: contactMessage
    });

  } catch (error) {
    console.error("Error updating contact message:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Toggle user email verification status
const toggleUserVerification = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isEmailVerified } = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isEmailVerified,
        emailVerificationToken: isEmailVerified ? null : undefined,
        emailVerificationExpires: isEmailVerified ? null : undefined
      },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: `User ${isEmailVerified ? 'verified' : 'unverified'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Error toggling user verification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user verification status'
    });
  }
};

// Delete a reservation (admin only)
const deleteReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;
    
    // Import all reservation models
    const TourReservation = require('../models/tourBook');
    const VehicleReservation = require('../models/VehicleReservation');
    const ResturentReservation = require('../models/resturentReservationModel');
    
    // Try to delete from each reservation type
    let deletedReservation = null;
    
    // Try ServiceReservation first
    deletedReservation = await ServiceReservation.findByIdAndDelete(reservationId);
    
    if (!deletedReservation) {
      // Try TourReservation
      deletedReservation = await TourReservation.findByIdAndDelete(reservationId);
    }
    
    if (!deletedReservation) {
      // Try VehicleReservation
      deletedReservation = await VehicleReservation.findByIdAndDelete(reservationId);
    }
    
    if (!deletedReservation) {
      // Try RestaurantReservation
      deletedReservation = await ResturentReservation.findByIdAndDelete(reservationId);
    }
    
    if (!deletedReservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Reservation deleted successfully',
      data: deletedReservation
    });
    
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete reservation',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllServices,
  getAllReservations,
  changeUserPassword,
  updateUser,
  deleteUser,
  createService,
  updateService,
  deleteService,
  getChatNotifications,
  markChatMessagesAsRead,
  getContactMessages,
  updateContactMessageStatus,
  toggleUserVerification,
  deleteReservation
}; 