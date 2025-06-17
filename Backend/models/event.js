import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Event description is required']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  time: {
    type: String,
  },
  location: {
    type: String,
    required: [true, 'Event location is required']
  },
  capacity: {
    type: Number
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }],
  // New field for registered players with their manager info
  registeredPlayers: [{
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true
    },
    playerName: {
      type: String,
      required: true
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',  // Player model with role 'manager'
    },
    managerName: {
      type: String
    },
    registeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  hostedBy: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Event', EventSchema);