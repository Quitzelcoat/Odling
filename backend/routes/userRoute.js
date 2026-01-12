import { Router } from 'express';
import { getUserById, searchUsers } from '../controllers/userController.js';

const router = Router();

router.get('/:id', getUserById);
router.get('/', searchUsers);

export default router;
