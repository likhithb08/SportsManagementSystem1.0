import express from 'express';
import Message from '../models/Message.js';
import Notification from '../models/notification.js'
import Player from '../models/player.js'

const router = express.Router();


// Get all messages
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Post a new message
router.post('/', async (req, res) => {
  const { sender, content, role } = req.body;

  if (!content || !sender || !role) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const message = new Message({ sender, content, role });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.post('/', async (req, res) => {
  const { sender, content, role } = req.body;

  if (!content || !sender || !role) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const message = new Message({ sender, content, role });
    await message.save();

    // Notify users with different roles
    const usersToNotify = await Player.find({ role: { $ne: role } });

    const notifications = usersToNotify.map(user => ({
      userId: user._id,
      type: 'chat',
      message: `New message from ${sender}`
    }));

    await Notification.insertMany(notifications);

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message and notifications:', error);
    res.status(500).json({ error: 'Failed to send message and create notifications' });
  }
});

export default router;
