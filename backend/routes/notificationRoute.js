import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  listNotifications,
  createNotification,
  markAsRead,
  markAllRead,
  deleteNotification,
} from '../controllers/notificationController.js';

const router = Router();

router.get('/', authenticate, listNotifications);
router.post('/', authenticate, createNotification);
router.post('/:id/read', authenticate, markAsRead);
router.post('/mark-all-read', authenticate, markAllRead);
router.delete('/:id', authenticate, deleteNotification);

export default router;
