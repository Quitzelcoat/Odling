// routes/commentsRoute.js (ESM)
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getComment,
  createReply,
  updateComment,
  deleteComment,
} from '../controllers/commentsController.js';

const router = Router();

router.get('/:id', getComment);
router.post('/:commentId/replies', authenticate, createReply);
router.put('/:id', authenticate, updateComment);
router.delete('/:id', authenticate, deleteComment);

export default router;
