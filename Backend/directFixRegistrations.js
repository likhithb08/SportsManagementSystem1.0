// IMMEDIATE FIX: Direct script to add multiple registrations to an event
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sports-management', {})
  .then(async () => {
    console.log("Connected to MongoDB");
    
    try {
      // Import Event model (this way to avoid import/require issues)
      const Event = mongoose.model('Event');
      
      // Find all events to get the IDs
      const events = await Event.find();
      
      if (events.length === 0) {
        console.log("No events found!");
        return;
      }
      
      // Log all events to choose from
      console.log("Found events:");
      events.forEach((event, index) => {
        console.log(`${index+1}. ${event.title} (ID: ${event._id}) - Currently has ${event.registeredPlayers ? event.registeredPlayers.length : 0} registrations`);
      });
      
      // Select the first event (or you can change the index)
      const targetEvent = events[0];
      console.log(`\nSelected event: ${targetEvent.title} (ID: ${targetEvent._id})`);
      
      // Create multiple test registrations
      const testRegistrations = [
        {
          playerId: "60d21b4667d0d8992e610c85",
          playerName: "Test Player",
          registeredAt: new Date()
        },
        {
          playerId: "60d21b4667d0d8992e610c86",
          playerName: "John Smith",
          registeredAt: new Date(new Date().setDate(new Date().getDate() - 1))
        },
        {
          playerId: "60d21b4667d0d8992e610c87",
          playerName: "Sarah Johnson",
          registeredAt: new Date(new Date().setDate(new Date().getDate() - 2))
        },
        {
          playerId: "60d21b4667d0d8992e610c88",
          playerName: "Alex Williams",
          registeredAt: new Date(new Date().setDate(new Date().getDate() - 3))
        }
      ];
      
      // Update the event with these registrations
      const result = await Event.updateOne(
        { _id: targetEvent._id },
        { $set: { registeredPlayers: testRegistrations } }
      );
      
      console.log(`\nUpdate result: ${result.modifiedCount} document updated`);
      
      // Verify the update by retrieving the event again
      const updatedEvent = await Event.findById(targetEvent._id);
      console.log(`\nUpdated event now has ${updatedEvent.registeredPlayers ? updatedEvent.registeredPlayers.length : 0} registrations:`);
      
      if (updatedEvent.registeredPlayers) {
        updatedEvent.registeredPlayers.forEach((player, index) => {
          console.log(`${index+1}. ${player.playerName} (ID: ${player.playerId}) - Registered on: ${new Date(player.registeredAt).toLocaleString()}`);
        });
      }
      
      console.log("\nFIX COMPLETE! Go back to your application and check the event details page.");
      
    } catch (error) {
      console.error("Error:", error);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(err => {
    console.error("Error connecting to MongoDB:", err);
  });
