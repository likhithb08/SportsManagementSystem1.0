import Team from '../models/team.js';
import Player from '../models/player.js';

export const getTeamsByManager = async (req, res) => {
  try {
    const managerId = req.session?.user?._id; // Get manager ID from session
    const teams = await Team.find({ manager: managerId }).populate('players', 'name position status');
    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching teams' });
  }
};

export const createTeam = async (req, res) => {
  try {
    const { name } = req.body;
    const managerId = req.session?.user?._id;
    
    if (!managerId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (!name) {
      return res.status(400).json({ message: 'Team name is required' });
    }
    
    const team = new Team({
      name,
      manager: managerId,
      players: []
    });
    
    const savedTeam = await team.save();
    res.status(201).json(savedTeam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating team' });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;
    const managerId = req.session?.user?._id;
    
    if (!managerId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const team = await Team.findOne({ _id: teamId, manager: managerId })
      .populate('players', 'username email position status');
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching team' });
  }
};

export const addPlayerToTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { playerId } = req.body;
    const managerId = req.session?.user?._id;
    
    if (!managerId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (!playerId) {
      return res.status(400).json({ message: 'Player ID is required' });
    }
    
    // Verify team belongs to manager
    const team = await Team.findOne({ _id: teamId, manager: managerId });
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if player already in team
    if (team.players.includes(playerId)) {
      return res.status(400).json({ message: 'Player already in team' });
    }
    
    // Add player to team
    team.players.push(playerId);
    await team.save();
    
    const updatedTeam = await Team.findById(teamId)
      .populate('players', 'username email position status');
      
    res.json(updatedTeam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding player to team' });
  }
};

export const removePlayerFromTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { playerId } = req.body;
    const managerId = req.session?.user?._id;
    
    if (!managerId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (!playerId) {
      return res.status(400).json({ message: 'Player ID is required' });
    }
    
    // Verify team belongs to manager
    const team = await Team.findOne({ _id: teamId, manager: managerId });
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Remove player from team
    team.players = team.players.filter(p => p.toString() !== playerId);
    await team.save();
    
    const updatedTeam = await Team.findById(teamId)
      .populate('players', 'username email position status');
      
    res.json(updatedTeam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error removing player from team' });
  }
};

export const getAvailablePlayers = async (req, res) => {
  try {
    const managerId = req.session?.user?._id;
    
    if (!managerId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Get all players with role "player"
    const players = await Player.find({ role: 'player' })
      .select('username email position');
    
    res.json(players);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching available players' });
  }
};
