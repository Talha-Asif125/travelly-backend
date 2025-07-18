const CommunityPost = require('../models/CommunityPost');
const User = require('../models/userModel');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images/community/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get all posts
const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await CommunityPost.find({ isReply: false })
      .populate('user', 'name email pic type')
      .populate('replies.user', 'name email pic type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CommunityPost.countDocuments({ isReply: false });

    res.json({
      success: true,
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get posts by location
const getPostsByLocation = async (req, res) => {
  try {
    const { location } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await CommunityPost.find({ 
      location: { $regex: location, $options: 'i' },
      isReply: false 
    })
      .populate('user', 'name email pic type')
      .populate('replies.user', 'name email pic type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new post
const createPost = async (req, res) => {
  try {
    const { content, location, hashtags } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    const newPost = new CommunityPost({
      user: req.user.id,
      content: content.trim(),
      location,
      hashtags: hashtags ? hashtags.split(',').map(tag => tag.trim()) : [],
      image: req.file ? req.file.filename : null
    });

    await newPost.save();
    
    const populatedPost = await CommunityPost.findById(newPost._id)
      .populate('user', 'name email pic type');

    res.status(201).json({ success: true, post: populatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add a reply to a post
const addReply = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Reply content is required' });
    }

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const reply = {
      user: req.user.id,
      content: content.trim(),
      image: req.file ? req.file.filename : null,
      createdAt: new Date()
    };

    post.replies.push(reply);
    await post.save();

    const updatedPost = await CommunityPost.findById(postId)
      .populate('user', 'name email pic type')
      .populate('replies.user', 'name email pic type');

    res.json({ success: true, post: updatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Like/Unlike a post
const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(userId);
    
    if (likeIndex > -1) {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
    } else {
      // Like the post
      post.likes.push(userId);
    }

    await post.save();
    
    const updatedPost = await CommunityPost.findById(postId)
      .populate('user', 'name email pic type')
      .populate('replies.user', 'name email pic type');

    res.json({ success: true, post: updatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a post
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    console.log('Delete post request:', { postId, userId, isAdmin: req.user.isAdmin });

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    console.log('Post owner ID:', post.user.toString());
    console.log('Current user ID:', userId.toString());
    console.log('User is admin:', req.user.isAdmin);

    // Check if user owns the post or is admin
    if (post.user.toString() !== userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    await CommunityPost.findByIdAndDelete(postId);
    console.log('Post deleted successfully');
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's posts
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await CommunityPost.find({ user: userId, isReply: false })
      .populate('user', 'name email pic type')
      .populate('replies.user', 'name email pic type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search posts
const searchPosts = async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await CommunityPost.find({
      $and: [
        { isReply: false },
        {
          $or: [
            { content: { $regex: query, $options: 'i' } },
            { location: { $regex: query, $options: 'i' } },
            { hashtags: { $in: [new RegExp(query, 'i')] } }
          ]
        }
      ]
    })
      .populate('user', 'name email pic type')
      .populate('replies.user', 'name email pic type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllPosts,
  getPostsByLocation,
  createPost,
  addReply,
  toggleLike,
  deletePost,
  getUserPosts,
  searchPosts,
  upload
}; 