const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getEvents)
  .post(protect, admin, createEvent);

router.route('/:id')
  .get(getEvent)
  .put(protect, admin, updateEvent)
  .delete(protect, admin, deleteEvent);

module.exports = router; 