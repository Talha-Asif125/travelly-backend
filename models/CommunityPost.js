const mongoose = require('mongoose');

const communityPostSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 500
  },
  image: {
    type: String,
    default: null
  },
  location: {
    type: String,
    default: null
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  replies: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 300
    },
    image: {
      type: String,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isReply: {
    type: Boolean,
    default: false
  },
  parentPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityPost',
    default: null
  },
  hashtags: [{
    type: String
  }],
  mentions: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for better performance
communityPostSchema.index({ user: 1, createdAt: -1 });
communityPostSchema.index({ location: 1 });
communityPostSchema.index({ hashtags: 1 });

module.exports = mongoose.model('CommunityPost', communityPostSchema); 