import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
  uploadProfilePicture,
  deleteProfilePicture,
} from '../controllers/pictureController.js';

const router = Router();

router.put('/', authenticate, upload.single('picture'), uploadProfilePicture);

router.delete('/', authenticate, deleteProfilePicture);

export default router;
