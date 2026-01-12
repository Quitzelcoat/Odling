import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { updateProfile } from '../controllers/profileController.js';

const router = Router();

router.put('/', authenticate, updateProfile);

export default router;
