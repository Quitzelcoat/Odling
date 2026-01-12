import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import uploadPost from '../middleware/uploadPost.js';

import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
} from '../controllers/postsController.js';

import {
  likePost,
  unlikePost,
  checkLiked,
} from '../controllers/likesController.js';

import { createComment } from '../controllers/commentsController.js';

const router = Router();

router.post('/', authenticate, uploadPost.single('image'), createPost);
router.get('/', getPosts);

router.get('/:id/liked', authenticate, checkLiked);
router.get('/:id', getPost);
router.put('/:id', authenticate, uploadPost.single('image'), updatePost);
router.delete('/:id', authenticate, deletePost);

router.post('/:postId/comments', authenticate, createComment);

router.post('/:id/like', authenticate, likePost);
router.delete('/:id/like', authenticate, unlikePost);

export default router;
