import mongoose from 'mongoose';

const trainingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  location: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Regular', 'Fitness', 'Technical', 'Tactical', 'Recovery'],
    default: 'Regular'
  },
  createdAt: { type: Date, default: Date.now }
});

const Training = mongoose.model('Training', trainingSchema);

export default Training; 