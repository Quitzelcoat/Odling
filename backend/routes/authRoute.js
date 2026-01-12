import { Router } from 'express';
const router = Router();

import {
  signUp,
  login,
  logout,
  getMe,
  guestLogin,
} from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';

router.post('/signup', authMiddleware.guestOnly, signUp);
router.post('/login', authMiddleware.guestOnly, login);
router.post('/logout', authMiddleware.authenticate, logout);
router.post('/guest', authMiddleware.guestOnly, guestLogin);
router.get('/me', authMiddleware.authenticate, getMe);

export default router;
