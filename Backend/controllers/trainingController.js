import Training from '../models/training.js';
import Team from '../models/team.js';

export const createTraining = async (req, res) => {
  try {
    const { title, teamId, startDateTime, endDateTime, location, description, type } = req.body;
    const managerId = req.session?.user?._id;
    
    if (!managerId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Validate required fields
    if (!title || !teamId || !startDateTime || !endDateTime || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Verify team belongs to manager
    const team = await Team.findOne({ _id: teamId, manager: managerId });
    if (!team) {
      return res.status(404).json({ message: 'Team not found or not managed by you' });
    }
    
    // Create training session
    const training = new Training({
      title,
      teamId,
      manager: managerId,
      startDateTime,
      endDateTime,
      location,
      description: description || '',
      type: type || 'Regular'
    });
    
    const savedTraining = await training.save();
    res.status(201).json(savedTraining);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating training session' });
  }
};

export const getTrainingsByManager = async (req, res) => {
  try {
    const managerId = req.session?.user?._id;
    
    if (!managerId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Get all training sessions created by the manager
    const trainings = await Training.find({ manager: managerId })
      .sort({ startDateTime: 1 }) // Sort by date ascending
      .populate('teamId', 'name');
    
    res.json(trainings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching training sessions' });
  }
};

export const deleteTraining = async (req, res) => {
  try {
    const { trainingId } = req.params;
    const managerId = req.session?.user?._id;
    
    if (!managerId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Verify training belongs to manager and delete it
    const training = await Training.findOneAndDelete({
      _id: trainingId,
      manager: managerId
    });
    
    if (!training) {
      return res.status(404).json({ message: 'Training not found or not created by you' });
    }
    
    res.json({ message: 'Training session deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting training session' });
  }
};

// Get training sessions for a specific player
export const getPlayerTrainings = async (req, res) => {
  try {
    const playerId = req.session?.user?._id;
    
    if (!playerId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Find the teams this player belongs to
    const teams = await Team.find({ players: playerId });
    
    if (!teams || teams.length === 0) {
      return res.status(200).json([]);
    }
    
    // Get team IDs
    const teamIds = teams.map(team => team._id);
    
    // Find all training sessions for these teams
    const trainingSessions = await Training.find({ 
      teamId: { $in: teamIds } 
    }).sort({ startDateTime: 1 });
    
    return res.status(200).json(trainingSessions);
  } catch (error) {
    console.error('Error fetching player trainings:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 