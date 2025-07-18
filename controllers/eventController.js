const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');

// Define a temporary event schema directly in controller
// This can be moved to a proper model file later
const eventSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    required: true 
  },
  date: { 
    type: String, 
    required: true 
  },
  time: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  capacity: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    required: true,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  image: { 
    type: String 
  }
}, {
  timestamps: true
});

// Only create the model if it doesn't already exist
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({});
  res.status(200).json(events);
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  res.status(200).json(event);
});

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = asyncHandler(async (req, res) => {
  const {
    name,
    type,
    date,
    time,
    location,
    description,
    capacity,
    status,
    image
  } = req.body;
  
  const event = await Event.create({
    name,
    type,
    date,
    time,
    location,
    description,
    capacity,
    status,
    image
  });
  
  if (event) {
    res.status(201).json(event);
  } else {
    res.status(400);
    throw new Error('Invalid event data');
  }
});

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = asyncHandler(async (req, res) => {
  const {
    name,
    type,
    date,
    time,
    location,
    description,
    capacity,
    status,
    image
  } = req.body;
  
  const event = await Event.findById(req.params.id);
  
  if (event) {
    event.name = name || event.name;
    event.type = type || event.type;
    event.date = date || event.date;
    event.time = time || event.time;
    event.location = location || event.location;
    event.description = description || event.description;
    event.capacity = capacity || event.capacity;
    event.status = status || event.status;
    event.image = image || event.image;
    
    const updatedEvent = await event.save();
    res.status(200).json(updatedEvent);
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  
  if (event) {
    await event.deleteOne();
    res.status(200).json({ message: 'Event removed' });
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
}; 