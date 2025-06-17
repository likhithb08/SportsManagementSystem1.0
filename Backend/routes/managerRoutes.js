// routes/managerRoutes.js
import express from 'express';
import Player from '../models/player.js'; // Assuming Player is the model for managers
import { 
  getTeamsByManager, 
  createTeam, 
  getTeamById, 
  addPlayerToTeam, 
  removePlayerFromTeam,
  getAvailablePlayers
} from '../controllers/teamController.js';
import {
  getPlayerById,
  updatePlayerPerformance,
  recordPlayerPerformance,
  getPlayerPerformance
} from '../controllers/playerController.js';
import {
  createTraining,
  getTrainingsByManager,
  deleteTraining
} from '../controllers/trainingController.js';
// import { isManager , protect } from '../middleware/authMiddleware.js';


const router = express.Router();

// Manager Login
router.get('/me', async (req, res) => {
  const email = req.session?.user?.email;
  if (!email) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const manager = await Player.findOne({ email });
    res.json({
      username: manager.username,
      email: manager.email,
      role: manager.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Manager Profile (optional)
// router.get('/me', (req, res) => {
//   res.json({ message: 'Manager profile endpoint working!' });
// });

// Team routes
router.get('/teams', getTeamsByManager);
router.post('/teams', createTeam);
router.get('/teams/:teamId', getTeamById);
router.post('/teams/:teamId/add-player', addPlayerToTeam);
router.post('/teams/:teamId/remove-player', removePlayerFromTeam);
router.get('/available-players', getAvailablePlayers);

// Player routes
router.get('/players/:playerId', getPlayerById);
router.get('/players/:playerId/performance', getPlayerPerformance);
router.post('/players/:playerId/performance', recordPlayerPerformance);

// Training routes
router.get('/trainings', getTrainingsByManager);
router.post('/trainings', createTraining);
router.delete('/trainings/:trainingId', deleteTraining);

export default router;
