// routes/postsRoute.js
const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
} = require('../controllers/postsController');
const likesController = require('../controllers/likesController');
const commentsController = require('../controllers/commentsController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, createPost);
router.get('/', getPosts);

router.get('/:id/liked', authenticate, likesController.checkLiked);
router.get('/:id', getPost);
router.put('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);

router.post(
  '/:postId/comments',
  authenticate,
  commentsController.createComment
);

router.post('/:id/like', authenticate, likesController.likePost);
router.delete('/:id/like', authenticate, likesController.unlikePost);

module.exports = router;
