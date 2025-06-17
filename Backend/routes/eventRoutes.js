import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  registerForEvent
} from '../controllers/eventController.js';

const router = express.Router();

// Public routes
router.get('/', getEvents);
router.get('/:id', getEvent);

// Player routes - temporarily bypass protection for testing
router.post('/:id/register', registerForEvent);

// Admin only routes
// Temporarily bypass protection for testing
router.post('/', createEvent);
router.put('/:id', protect, authorize('admin'), updateEvent);
router.delete('/:id', protect, authorize('admin'), deleteEvent);

export default router; 