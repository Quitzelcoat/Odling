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
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, createPost);
router.get('/', getPosts);
router.get('/:id', getPost);
router.put('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);

module.exports = router;
