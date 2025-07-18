const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxlength: [100, "Name cannot exceed 100 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email address"
    ]
  },
  message: {
    type: String,
    required: [true, "Message is required"],
    trim: true,
    maxlength: [1000, "Message cannot exceed 1000 characters"]
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [200, "Subject cannot exceed 200 characters"],
    default: "General Inquiry"
  },
  status: {
    type: String,
    enum: ["new", "read", "replied", "resolved"],
    default: "new"
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [500, "Admin notes cannot exceed 500 characters"]
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null // null for guest users
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient querying
contactMessageSchema.index({ status: 1, createdAt: -1 });
contactMessageSchema.index({ email: 1 });

// Virtual for formatted creation date
contactMessageSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Instance method to mark as read
contactMessageSchema.methods.markAsRead = function() {
  this.status = 'read';
  return this.save();
};

// Instance method to add admin notes
contactMessageSchema.methods.addAdminNotes = function(notes) {
  this.adminNotes = notes;
  return this.save();
};

// Static method to get unread count
contactMessageSchema.statics.getUnreadCount = function() {
  return this.countDocuments({ status: 'new' });
};

// Static method to get recent messages
contactMessageSchema.statics.getRecentMessages = function(limit = 10) {
  return this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name email')
    .exec();
};

module.exports = mongoose.model("ContactMessage", contactMessageSchema); 