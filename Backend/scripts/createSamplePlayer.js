import mongoose from 'mongoose';
import Player from '../models/player.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sports-team-manager')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Create a sample player with performance data
const createSamplePlayer = async () => {
  try {
    // Check if the player already exists
    const existingPlayer = await Player.findOne({ email: 'player1@example.com' });
    
    if (existingPlayer) {
      console.log('Player1 already exists, updating performance data...');
      
      // Update existing player's performance data
      existingPlayer.performance = {
        fitness: 85,
        technique: 78,
        teamwork: 90,
        consistency: 82,
        discipline: 88,
        notes: 'Sample performance data for Player1',
        updatedAt: new Date()
      };
      
      await existingPlayer.save();
      console.log('Updated Player1 performance data successfully');
    } else {
      // Create a new player
      const player1 = new Player({
        username: 'Player1',
        email: 'player1@example.com',
        password: 'password123', // Will be automatically hashed by the model
        role: 'player',
        position: 'Forward',
        status: 'Active',
        performance: {
          fitness: 85,
          technique: 78,
          teamwork: 90,
          consistency: 82,
          discipline: 88,
          notes: 'Sample performance data for Player1',
          updatedAt: new Date()
        }
      });
      
      await player1.save();
      console.log('Created Player1 with sample performance data successfully');
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating/updating sample player:', error);
    process.exit(1);
  }
};

// Run the function
createSamplePlayer(); 