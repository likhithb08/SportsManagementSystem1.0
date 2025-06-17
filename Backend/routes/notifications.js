// routes/notifications.js
import express from 'express';
import Notification from '../models/notification.js';
import Player from '../models/player.js';

const router = express.Router();

// Get all notifications for the logged-in user
router.get('/', async (req, res) => {
  try {
    // Get user info from session
    const email = req.session?.user?.email;
    if (!email) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Find user by email
    const user = await Player.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get notifications for this user
    const notifications = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20); // Limit to 20 most recent notifications
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});
  
// Mark a single notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id, 
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to update notification' });
  }
});

// Mark all notifications as read for a user
router.put('/mark-all-read', async (req, res) => {
  try {
    // Get user info from session
    const email = req.session?.user?.email;
    if (!email) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Find user by email
    const user = await Player.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update all unread notifications for this user
    const result = await Notification.updateMany(
      { 
        userId: user._id,
        read: false 
      },
      { 
        $set: { read: true } 
      }
    );
    
    res.json({ 
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Failed to update notifications' });
  }
});

export default router;
