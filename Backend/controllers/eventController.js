import Event from '../models/event.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Admin only)
export const createEvent = asyncHandler(async (req, res, next) => {
  try {
    console.log('Create event request body:', req.body);
    console.log('User session:', req.session?.user);
    
    // Use the createdBy from request body or from session if available
    let eventData = req.body;
    
    // If user is in session but createdBy not in request, use session user ID
    if (req.session && req.session.user && req.session.user._id && !eventData.createdBy) {
      eventData.createdBy = req.session.user._id;
    }
    
    // Log the final event data being created
    console.log('Creating event with data:', eventData);
    
    const event = await Event.create(eventData);

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    
    // Handle common validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate event entry'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Server error, could not create event'
    });
  }
});

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getEvents = asyncHandler(async (req, res, next) => {
  const events = await Event.find().sort({ date: 1 });

  res.status(200).json({
    success: true,
    count: events.length,
    data: events
  });
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
export const getEvent = asyncHandler(async (req, res, next) => {
  console.log(`Getting event with ID: ${req.params.id}`);
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new ErrorResponse(`Event not found with id of ${req.params.id}`, 404));
  }

  // Log the registrations to debug
  console.log(`Found event: ${event.title}`);
  console.log(`Registered players: ${event.registeredPlayers ? event.registeredPlayers.length : 0}`);
  
  // Add information about the current user's registration status
  let currentUserInfo = {
    isRegistered: false,
    registrationDetails: null
  };
  
  // Check if user is logged in via session
  if (req.session && req.session.user && req.session.user._id) {
    const userId = req.session.user._id.toString();
    console.log(`Checking if user ${userId} is registered for event ${event._id}`);
    
    // Check if this user is registered for this event
    if (event.registeredPlayers && event.registeredPlayers.length > 0) {
      const userRegistration = event.registeredPlayers.find(reg => {
        const regPlayerId = reg.playerId.toString();
        return regPlayerId === userId;
      });
      
      if (userRegistration) {
        console.log(`User ${userId} is registered for this event`);
        currentUserInfo.isRegistered = true;
        currentUserInfo.registrationDetails = userRegistration;
      } else {
        console.log(`User ${userId} is NOT registered for this event`);
      }
    }
  } else {
    console.log('No user session found when fetching event details');
  }
  
  if (event.registeredPlayers && event.registeredPlayers.length > 0) {
    console.log('Registered players details:', event.registeredPlayers);
  }

  // Return event data with current user registration status
  res.status(200).json({
    success: true,
    data: event,
    currentUser: currentUserInfo
  });
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Admin only)
export const updateEvent = asyncHandler(async (req, res, next) => {
  let event = await Event.findById(req.params.id);

  if (!event) {
    return next(new ErrorResponse(`Event not found with id of ${req.params.id}`, 404));
  }

  event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: event
  });
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin only)
export const deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new ErrorResponse(`Event not found with id of ${req.params.id}`, 404));
  }

  await event.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Register player for an event
// @route   POST /api/events/:id/register
// @access  Private (Player only) - but temporarily public for testing
export const registerForEvent = asyncHandler(async (req, res, next) => {
  try {
    // IMPORTANT: Always prioritize user data from session
    // This ensures proper MongoDB user IDs are used for registration
    let playerId, playerName;
    
    if (req.session && req.session.user && req.session.user._id) {
      // User is authenticated - use session data
      playerId = req.session.user._id;
      playerName = req.session.user.username || req.session.user.name || 'Player';
      console.log(`Using authenticated user from session: ${playerName} (ID: ${playerId})`);
    } else if (req.body.playerId) {
      // Fallback to request body if provided
      playerId = req.body.playerId;
      playerName = req.body.playerName || 'Player';
      console.log(`Using player data from request body: ${playerName} (ID: ${playerId})`);
    } else {
      // Last resort: generate a random test user
      // This is only for development/testing
      const randomId = Math.random().toString().substring(2, 10);
      playerId = `60d21b4667d0d8992e610c${randomId}`;
      playerName = `Player ${randomId.substring(0, 2)}`;
      console.log(`Generated test player for development: ${playerName} (ID: ${playerId})`);
    }
    
    console.log(`Attempting to register player: ${playerName} (${playerId}) for event ID: ${req.params.id}`);
    
    // Find the event
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      console.log(`Event not found with ID: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    console.log(`Found event: ${event.title}`);
    console.log(`Current registered players: ${event.registeredPlayers ? event.registeredPlayers.length : 0}`);
    
    // Convert playerId to string for comparison
    const playerIdStr = playerId.toString();
    
    // Check if player is already registered - compare string versions
    const alreadyRegistered = event.registeredPlayers && event.registeredPlayers.some(registration => {
      const regPlayerId = registration.playerId.toString();
      const isMatch = regPlayerId === playerIdStr;
      console.log(`Comparing ${regPlayerId} with ${playerIdStr}: ${isMatch}`);
      return isMatch;
    });
    
    if (alreadyRegistered) {
      console.log(`Player ${playerName} is already registered for this event`);
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }
    
    // Check if event is at capacity (if capacity is set)
    if (event.capacity && event.registeredPlayers.length >= event.capacity) {
      console.log(`Event has reached maximum capacity: ${event.registeredPlayers.length}/${event.capacity}`);
      return res.status(400).json({
        success: false,
        message: 'Event has reached maximum capacity'
      });
    }

    // Get the player's manager information if available
    // This would typically come from player's team info
    let managerInfo = {
      managerId: null,
      managerName: null
    };

    // Create registration object with unique identifiers
    const registration = {
      playerId: playerIdStr,
      playerName,
      managerId: managerInfo.managerId,
      managerName: managerInfo.managerName,
      registeredAt: new Date()
    };
    
    console.log(`Adding new registration:`, registration);
    
    // Initialize registeredPlayers array if it doesn't exist
    if (!event.registeredPlayers) {
      event.registeredPlayers = [];
    }
    
    // Register the player using findOneAndUpdate to ensure atomic operation
    await Event.findOneAndUpdate(
      { _id: event._id },
      { $addToSet: { registeredPlayers: registration } },
      { new: true }
    );
    
    // Fetch the updated event to get accurate registration count
    const updatedEvent = await Event.findById(event._id);
    console.log(`Player registered successfully. Total registrations: ${updatedEvent.registeredPlayers.length}`);
    console.log('All registered players:', updatedEvent.registeredPlayers);
    
    // Return success with the updated event
    res.status(200).json({
      success: true,
      message: 'Successfully registered for the event',
      data: updatedEvent
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error, could not complete registration'
    });
  }
});