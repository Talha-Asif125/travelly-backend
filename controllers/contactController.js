const ContactMessage = require("../models/ContactMessage");
const ApiResponse = require("../utils/ApiResponse");
// const { validationResult } = require("express-validator"); // Removed for quick access

// @desc    Submit a contact message
// @route   POST /api/contact
// @access  Public
const submitContactMessage = async (req, res) => {
  try {
    // Check for validation errors - DISABLED FOR QUICK ACCESS
    /*
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        ApiResponse.error("Validation failed", errors.array())
      );
    }
    */

    const { name, email, message, subject } = req.body;

    // Get client IP and user agent for security/tracking
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Create contact message data
    const contactData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      message: message.trim(),
      subject: subject ? subject.trim() : "General Inquiry",
      ipAddress,
      userAgent
    };

    // If user is authenticated, associate the message with their account
    if (req.user) {
      contactData.userId = req.user._id || req.user.id;
    }

    // Create and save the contact message
    const contactMessage = new ContactMessage(contactData);
    await contactMessage.save();

    // Log for admin notification (in a real app, you might send email notification)
    console.log(`New contact message received from ${email} (${name})`);

    res.status(201).json(
      ApiResponse.success(
        {
          id: contactMessage._id,
          message: "Your message has been sent successfully!"
        },
        "Message submitted successfully"
      )
    );

  } catch (error) {
    console.error("Error submitting contact message:", error);
    
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json(
        ApiResponse.error("Validation failed", errorMessages)
      );
    }

    res.status(500).json(
      ApiResponse.error("Failed to submit message. Please try again later.")
    );
  }
};

// @desc    Get all contact messages (Admin only)
// @route   GET /api/contact/admin
// @access  Private (Admin)
const getAllContactMessages = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc' 
    } = req.query;

    // Build query
    const query = {};
    
    if (status && ['new', 'read', 'replied', 'resolved'].includes(status)) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const [messages, total] = await Promise.all([
      ContactMessage.find(query)
        .populate('userId', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .exec(),
      ContactMessage.countDocuments(query)
    ]);

    // Get additional stats
    const stats = await ContactMessage.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.json(
      ApiResponse.success({
        messages,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum
        },
        stats: {
          total,
          new: statusCounts.new || 0,
          read: statusCounts.read || 0,
          replied: statusCounts.replied || 0,
          resolved: statusCounts.resolved || 0
        }
      })
    );

  } catch (error) {
    console.error("Error fetching contact messages:", error);
    res.status(500).json(
      ApiResponse.error("Failed to fetch contact messages")
    );
  }
};

// @desc    Get a specific contact message by ID (Admin only)
// @route   GET /api/contact/admin/:id
// @access  Private (Admin)
const getContactMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await ContactMessage.findById(id)
      .populate('userId', 'name email phone');

    if (!message) {
      return res.status(404).json(
        ApiResponse.notFound("Contact message not found")
      );
    }

    // Mark as read if it's new
    if (message.status === 'new') {
      message.status = 'read';
      await message.save();
    }

    res.json(ApiResponse.success(message));

  } catch (error) {
    console.error("Error fetching contact message:", error);
    res.status(500).json(
      ApiResponse.error("Failed to fetch contact message")
    );
  }
};

// @desc    Update contact message status (Admin only)
// @route   PUT /api/contact/admin/:id/status
// @access  Private (Admin)
const updateContactMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!['new', 'read', 'replied', 'resolved'].includes(status)) {
      return res.status(400).json(
        ApiResponse.error("Invalid status. Must be: new, read, replied, or resolved")
      );
    }

    const message = await ContactMessage.findById(id);

    if (!message) {
      return res.status(404).json(
        ApiResponse.notFound("Contact message not found")
      );
    }

    message.status = status;
    if (adminNotes) {
      message.adminNotes = adminNotes;
    }

    await message.save();

    res.json(
      ApiResponse.success(
        message,
        `Message status updated to ${status}`
      )
    );

  } catch (error) {
    console.error("Error updating contact message status:", error);
    res.status(500).json(
      ApiResponse.error("Failed to update message status")
    );
  }
};

// @desc    Delete contact message (Admin only)
// @route   DELETE /api/contact/admin/:id
// @access  Private (Admin)
const deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await ContactMessage.findById(id);

    if (!message) {
      return res.status(404).json(
        ApiResponse.notFound("Contact message not found")
      );
    }

    await ContactMessage.findByIdAndDelete(id);

    res.json(
      ApiResponse.success(
        null,
        "Contact message deleted successfully"
      )
    );

  } catch (error) {
    console.error("Error deleting contact message:", error);
    res.status(500).json(
      ApiResponse.error("Failed to delete contact message")
    );
  }
};

// @desc    Get unread contact messages count (Admin only)
// @route   GET /api/contact/admin/unread-count
// @access  Private (Admin)
const getUnreadCount = async (req, res) => {
  try {
    const count = await ContactMessage.getUnreadCount();
    
    res.json(
      ApiResponse.success({
        unreadCount: count
      })
    );

  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json(
      ApiResponse.error("Failed to get unread count")
    );
  }
};

module.exports = {
  submitContactMessage,
  getAllContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
  deleteContactMessage,
  getUnreadCount
}; 