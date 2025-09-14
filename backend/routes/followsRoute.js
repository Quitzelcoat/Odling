// routes/followsRoute.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const followController = require('../controllers/followsController');

router.post(
  '/requests/:toUserId',
  authenticate,
  followController.sendFollowRequest
);
router.delete(
  '/requests/:toUserId',
  authenticate,
  followController.cancelFollowRequest
);

router.get(
  '/requests/incoming',
  authenticate,
  followController.getIncomingRequests
);
router.get(
  '/requests/outgoing',
  authenticate,
  followController.getOutgoingRequests
);

// respond to a specific follow request (accept / reject)
router.post(
  '/requests/:requestId/respond',
  authenticate,
  followController.respondToRequest
);

// unfollow
router.delete('/:followedId', authenticate, followController.unfollowUser);

// lists
router.get('/followers/:userId', followController.getFollowers); // public
router.get('/following/:userId', followController.getFollowing); // public

module.exports = router;
