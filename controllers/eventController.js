const mongoose = require('mongoose');

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
const getEvents = async (req, res) => {
  try {
    console.log("Getting all events...");
  const events = await Event.find({});
    console.log(`Found ${events.length} events`);
  res.status(200).json(events);
  } catch (error) {
    console.error("Error getting events:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEvent = async (req, res) => {
  try {
    console.log("Getting event with ID:", req.params.id);
  const event = await Event.findById(req.params.id);
  
  if (!event) {
      return res.status(404).json({ message: 'Event not found' });
  }
  
  res.status(200).json(event);
  } catch (error) {
    console.error("Error getting event:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
  try {
    console.log("Creating event with data:", req.body);
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
  
    console.log("Event created:", event);
    res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
  try {
    console.log("Updating event with ID:", req.params.id);
    console.log("Update data:", req.body);
    
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
  
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
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
    console.log("Event updated:", updatedEvent);
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
  try {
    console.log("Deleting event with ID:", req.params.id);
  const event = await Event.findById(req.params.id);
  
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    await event.deleteOne();
    console.log("Event deleted successfully");
    res.status(200).json({ message: 'Event removed' });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
}; 