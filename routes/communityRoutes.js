const express = require('express');
const router = express.Router();
const { 
  getAllPosts, 
  getPostsByLocation, 
  createPost, 
  addReply, 
  toggleLike, 
  deletePost, 
  getUserPosts, 
  searchPosts,
  upload 
} = require('../controllers/communityController');
const { verifyToken } = require('../middleware/authMiddleware');

// Test endpoint for debugging authentication
router.get('/test-auth', verifyToken, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Authentication working', 
    user: req.user 
  });
});

// Public routes
router.get('/posts', getAllPosts);
router.get('/posts/location/:location', getPostsByLocation);
router.get('/posts/search', searchPosts);
router.get('/posts/user/:userId', getUserPosts);

// Protected routes (require authentication)
router.post('/posts', verifyToken, upload.single('image'), createPost);
router.post('/posts/:postId/reply', verifyToken, upload.single('image'), addReply);
router.post('/posts/:postId/like', verifyToken, toggleLike);
router.delete('/posts/:postId', verifyToken, deletePost);

module.exports = router; 