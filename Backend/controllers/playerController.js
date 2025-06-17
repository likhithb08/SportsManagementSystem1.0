import Player from '../models/player.js';

export const getPlayerById = async (req, res) => {
  try {
    const { playerId } = req.params;
    const managerId = req.session?.user?._id;
    
    console.log("getPlayerById - playerId:", playerId);
    console.log("getPlayerById - managerId from session:", managerId);
    
    if (!managerId) {
      console.log("getPlayerById - Not authenticated, no managerId in session");
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const player = await Player.findById(playerId);
    if (!player) {
      console.log("getPlayerById - Player not found");
      return res.status(404).json({ message: 'Player not found' });
    }
    
    console.log("getPlayerById - Player found:", player.username);
    res.json(player);
  } catch (err) {
    console.error("getPlayerById - Error:", err);
    res.status(500).json({ message: 'Error fetching player data' });
  }
};

export const updatePlayerPerformance = async (req, res) => {
  try {
    const { playerId } = req.params;
    const managerId = req.session?.user?._id;
    const performanceData = req.body;
    
    console.log("updatePlayerPerformance - playerId:", playerId);
    console.log("updatePlayerPerformance - managerId from session:", managerId);
    console.log("updatePlayerPerformance - performanceData:", performanceData);
    
    if (!managerId) {
      console.log("updatePlayerPerformance - Not authenticated, no managerId in session");
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Validate performance data
    const requiredFields = ['fitness', 'technique', 'teamwork', 'consistency', 'discipline'];
    for (const field of requiredFields) {
      const value = performanceData[field];
      if (typeof value !== 'number' || value < 0 || value > 100) {
        console.log(`updatePlayerPerformance - Invalid ${field} value:`, value);
        return res.status(400).json({ 
          message: `Invalid ${field} value. Must be a number between 0 and 100.` 
        });
      }
    }
    
    // Add timestamp to performance data
    performanceData.updatedAt = new Date();
    
    const player = await Player.findByIdAndUpdate(
      playerId,
      { performance: performanceData },
      { new: true }
    );
    
    if (!player) {
      console.log("updatePlayerPerformance - Player not found");
      return res.status(404).json({ message: 'Player not found' });
    }
    
    console.log("updatePlayerPerformance - Performance updated for player:", player.username);
    res.json(player);
  } catch (err) {
    console.error("updatePlayerPerformance - Error:", err);
    res.status(500).json({ message: 'Error updating player performance' });
  }
};

// Record performance data for a specific player (by manager)
export const recordPlayerPerformance = async (req, res) => {
  try {
    const { playerId } = req.params;
    const managerId = req.session?.user?._id;
    const { fitness, technique, teamwork, consistency, discipline, notes } = req.body;
    
    console.log('Manager recording performance for player:', playerId);
    
    if (!managerId) {
      return res.status(401).json({ message: 'Not authenticated as manager' });
    }
    
    // Find the player by ID
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // Update player performance data
    player.performance = {
      fitness: fitness || player.performance?.fitness || 0,
      technique: technique || player.performance?.technique || 0,
      teamwork: teamwork || player.performance?.teamwork || 0,
      consistency: consistency || player.performance?.consistency || 0,
      discipline: discipline || player.performance?.discipline || 0,
      notes: notes || player.performance?.notes || '',
      updatedAt: new Date(),
      updatedBy: managerId // Track which manager updated the performance
    };
    
    await player.save();
    console.log('Updated player performance successfully');
    
    res.status(200).json(player.performance);
  } catch (error) {
    console.error('Error recording player performance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get performance data for a specific player
export const getPlayerPerformance = async (req, res) => {
  try {
    const { playerId } = req.params;
    
    // Find the player by ID
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // Return performance data if it exists, or default values
    const performanceData = player.performance || {
      fitness: 0,
      technique: 0, 
      teamwork: 0,
      consistency: 0,
      discipline: 0,
      notes: ''
    };
    
    res.status(200).json(performanceData);
  } catch (error) {
    console.error('Error fetching player performance:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 