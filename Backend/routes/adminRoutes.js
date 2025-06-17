// routes/managerRoutes.js
import express from 'express';
import Player from '../models/player.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get admin profile when already authenticated
router.get('/me', protect, authorize('admin'), async (req, res) => {
  try {
    // User is already available in req.user from the protect middleware
    res.json({
      _id: req.user._id,
      name: req.user.username, // Use username field from Player model
      email: req.user.email,
      role: req.user.role,
    });
  } catch (error) {
    console.error('Error in /admin/me:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard data
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    // Placeholder stats for now, you can replace with real data
    const stats = [
      { title: 'Total Athletes', value: '124', change: '+12%' },
      { title: 'Active Teams', value: '8', change: '+2%' },
      { title: 'Upcoming Events', value: '6', change: '+3%' },
      { title: 'Notifications', value: '24', change: '+5%' }
    ];

    const activities = [
      { type: 'New Athlete', message: 'John Doe joined the platform', time: '2h ago' },
      { type: 'Event Scheduled', message: 'Tournament scheduled for next month', time: '4h ago' },
      { type: 'System Update', message: 'Platform updated to version 2.1', time: '1d ago' },
      { type: 'Team Created', message: 'New team "Eagles" created', time: '2d ago' }
    ];

    res.json({
      stats,
      activities
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

export default router;
