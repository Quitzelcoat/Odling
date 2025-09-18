// routes/commentsRoute.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const commentsController = require('../controllers/commentsController');

router.get('/:id', commentsController.getComment);

router.post(
  '/:commentId/replies',
  authenticate,
  commentsController.createReply
);

router.put('/:id', authenticate, commentsController.updateComment);
router.delete('/:id', authenticate, commentsController.deleteComment);

module.exports = router;
