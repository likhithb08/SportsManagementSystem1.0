import express from 'express';
import Player from '../models/player.js';
import Team from '../models/team.js';
import Manager from '../models/manager.js';
import { getPlayerTrainings } from '../controllers/trainingController.js';

const router = express.Router();

// Get logged-in player info
router.get('/me', async (req, res) => {
  const email = req.session?.user?.email;

  if (!email) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const user = await Player.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      username: user.username,
      email: user.email,
      role: user.role,
      // any other fields you want to expose
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get player's schedule
router.get('/schedule', async (req, res) => {
  try {
    // Get the player's ID from the session
    const playerId = req.session?.user?._id;
    if (!playerId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Find the teams this player belongs to
    const teams = await Team.find({ players: playerId });
    
    if (!teams || teams.length === 0) {
      return res.status(200).json([]);
    }

    // In a real app, you would query the database for actual scheduled matches
    // For now, we'll return mock data
    const now = new Date();
    const mockSchedule = [
      {
        date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '03:00 PM',
        opponent: 'Red Hawks',
        event: 'League Match',
        tournament: 'National League',
        organiser: 'Sports Federation'
      },
      {
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '05:00 PM',
        opponent: 'Blue Wolves',
        event: 'Friendly',
        tournament: 'City Cup',
        organiser: 'City Sports'
      },
      {
        date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '06:30 PM',
        opponent: 'Golden Eagles',
        event: 'Playoff',
        tournament: 'Regional Cup',
        organiser: 'Regional Sports Authority'
      }
    ];
    
    res.status(200).json(mockSchedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get player training sessions
router.get('/training', getPlayerTrainings);

// Get performance stats
router.get('/performance', async (req, res) => {
  try {
    // Debug log session info
    console.log('Session data:', req.session);
    
    // Get the player's ID from the session
    const playerId = req.session?.user?._id;
    console.log('Player ID from session:', playerId);
    
    if (!playerId) {
      // If no player ID in session, try to get player by email
      const email = req.session?.user?.email;
      console.log('Trying with email:', email);
      
      if (email) {
        const player = await Player.findOne({ email });
        if (player) {
          console.log('Found player by email:', player._id);
          
          // Return performance data if it exists, or default values
          const performanceData = player.performance || {
            fitness: 75,
            technique: 70, 
            teamwork: 80,
            consistency: 65,
            discipline: 75,
            notes: ''
          };
          
          return res.status(200).json(performanceData);
        }
      }
      
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Find the player
    const player = await Player.findById(playerId);
    console.log('Player found:', player ? 'Yes' : 'No');
    
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Return performance data if it exists, or default values
    const performanceData = player.performance || {
      fitness: 75,
      technique: 70, 
      teamwork: 80,
      consistency: 65,
      discipline: 75,
      notes: ''
    };

    res.status(200).json(performanceData);
  } catch (error) {
    console.error('Error fetching performance data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get player's team and manager info
router.get('/team-info', async (req, res) => {
  try {
    // Get the player's ID from the session
    const playerId = req.session?.user?._id;
    if (!playerId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Find teams where this player is a member
    const team = await Team.findOne({ players: playerId }).populate('manager');
    
    if (!team) {
      return res.status(200).json({ team: null, manager: null });
    }

    // Get manager info
    const manager = await Manager.findById(team.manager).select('-password');

    res.status(200).json({ team, manager });
  } catch (error) {
    console.error('Error fetching team info:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get player's performance history
router.get('/performance-history', async (req, res) => {
  try {
    // Get the player's ID from the session
    const playerId = req.session?.user?._id;
    if (!playerId) {
      // Try with email if ID is not available
      const email = req.session?.user?.email;
      if (!email) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Find player by email
      const player = await Player.findOne({ email });
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }
      
      return generatePerformanceHistory(player, res);
    }

    // Find the player
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    return generatePerformanceHistory(player, res);
  } catch (error) {
    console.error('Error fetching performance history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to generate performance history
function generatePerformanceHistory(player, res) {
  // Get current performance data
  const currentPerformance = player.performance || {
    fitness: 70,
    technique: 65,
    teamwork: 75,
    consistency: 60,
    discipline: 80
  };
  
  console.log('Current performance:', currentPerformance);
  
  // For demo purposes, create a realistic performance progression
  // In a real app, you'd fetch this from a database
  const today = new Date();
  
  // If we have actual performance data, generate a realistic progression
  // leading up to the current values
  const performanceHistory = [
    {
      fitness: Math.max(20, currentPerformance.fitness - Math.floor(Math.random() * 30)),
      technique: Math.max(20, currentPerformance.technique - Math.floor(Math.random() * 25)),
      teamwork: Math.max(20, currentPerformance.teamwork - Math.floor(Math.random() * 20)),
      consistency: Math.max(20, currentPerformance.consistency - Math.floor(Math.random() * 35)),
      discipline: Math.max(20, currentPerformance.discipline - Math.floor(Math.random() * 15)),
      updatedAt: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
    },
    {
      fitness: Math.max(30, currentPerformance.fitness - Math.floor(Math.random() * 20)),
      technique: Math.max(30, currentPerformance.technique - Math.floor(Math.random() * 15)),
      teamwork: Math.max(30, currentPerformance.teamwork - Math.floor(Math.random() * 10)),
      consistency: Math.max(30, currentPerformance.consistency - Math.floor(Math.random() * 25)),
      discipline: Math.max(30, currentPerformance.discipline - Math.floor(Math.random() * 10)),
      updatedAt: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
    },
    {
      fitness: Math.max(40, currentPerformance.fitness - Math.floor(Math.random() * 15)),
      technique: Math.max(40, currentPerformance.technique - Math.floor(Math.random() * 10)),
      teamwork: Math.max(40, currentPerformance.teamwork - Math.floor(Math.random() * 5)),
      consistency: Math.max(40, currentPerformance.consistency - Math.floor(Math.random() * 15)),
      discipline: Math.max(40, currentPerformance.discipline - Math.floor(Math.random() * 5)),
      updatedAt: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    },
    {
      // Include actual current performance as the last data point
      ...currentPerformance,
      updatedAt: currentPerformance.updatedAt || today
    }
  ];
  
  console.log('Generated performance history with points:', performanceHistory.length);
  return res.status(200).json(performanceHistory);
}

export default router;
