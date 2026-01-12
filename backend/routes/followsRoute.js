// routes/followsRoute.js
import express from 'express';
const router = express.Router();

import authMiddleware from '../middleware/auth.js';
const { authenticate } = authMiddleware;

import {
  sendFollowRequest,
  cancelFollowRequest,
  getIncomingRequests,
  getOutgoingRequests,
  respondToRequest,
  unfollowUser,
  getFollowers, // ✅ ADD THESE
  getFollowing,
} from '../controllers/followsController.js';

router.post('/requests/:toUserId', authenticate, sendFollowRequest);
router.delete('/requests/:toUserId', authenticate, cancelFollowRequest);

router.get('/requests/incoming', authenticate, getIncomingRequests);
router.get('/requests/outgoing', authenticate, getOutgoingRequests);

// respond to a specific follow request (accept / reject)
router.post('/requests/:requestId/respond', authenticate, respondToRequest);

// unfollow
router.delete('/:followedId', authenticate, unfollowUser);

// lists
router.get('/followers/:userId', getFollowers); // public
router.get('/following/:userId', getFollowing); // public

export default router;
