// Script to add test registrations to an event
const mongoose = require('mongoose');
const Event = require('./models/event.js').default;

// Connect to database
mongoose.connect('mongodb://localhost:27017/sports-management', {})
  .then(async () => {
    console.log("✅ Connected to MongoDB");
    
    try {
      // Get all events
      const events = await Event.find();
      
      if (events.length === 0) {
        console.log("No events found!");
        process.exit(0);
      }
      
      // Select the first event to add registrations to
      const targetEvent = events[0];
      console.log(`Selected event: ${targetEvent.title} (ID: ${targetEvent._id})`);
      
      // Create test registrations
      const testRegistrations = [
        {
          playerId: "60d21b4667d0d8992e610c85",
          playerName: "Test Player 1",
          registeredAt: new Date()
        },
        {
          playerId: "60d21b4667d0d8992e610c86",
          playerName: "Test Player 2",
          registeredAt: new Date()
        },
        {
          playerId: "60d21b4667d0d8992e610c87",
          playerName: "Test Player 3",
          registeredAt: new Date()
        }
      ];
      
      // Reset registrations and add test data
      targetEvent.registeredPlayers = testRegistrations;
      
      // Save the changes
      await targetEvent.save();
      
      console.log("✅ Test registrations added successfully!");
      console.log("Registrations:", targetEvent.registeredPlayers);
      
    } catch (error) {
      console.error("Error:", error);
    } finally {
      mongoose.disconnect();
      console.log("Disconnected from MongoDB");
    }
  })
  .catch(err => {
    console.error("Failed to connect to MongoDB:", err);
  });
