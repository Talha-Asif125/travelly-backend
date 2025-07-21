const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
// const { protect, admin } = require('../middleware/authMiddleware'); // Temporarily disabled for admin testing

// Test route to verify events are working
router.get('/test', (req, res) => {
  res.json({ message: 'Events API is working!', timestamp: new Date() });
});

router.route('/')
  .get(getEvents)
  .post(createEvent); // Temporarily removed auth requirements

router.route('/:id')
  .get(getEvent)
  .put(updateEvent) // Temporarily removed auth requirements
  .delete(deleteEvent); // Temporarily removed auth requirements

module.exports = router; 