// controllers/followController.js
const prisma = require('../prismaClient');

exports.sendFollowRequest = async (req, res) => {
  try {
    const fromUserId = req.user.id;
    const toUserId = parseInt(req.params.toUserId, 10);

    if (Number.isNaN(toUserId))
      return res.status(400).json({ error: 'Invalid user id' });
    if (toUserId === fromUserId)
      return res.status(400).json({ error: 'Cannot follow yourself' });

    // Ensure target exists and is not deleted
    const toUser = await prisma.user.findUnique({ where: { id: toUserId } });
    if (!toUser || toUser.deleted)
      return res.status(404).json({ error: 'User not found' });

    // If already following
    const existingFollow = await prisma.follow
      .findUnique({
        where: {
          followerId_followedId: {
            followerId: fromUserId,
            followedId: toUserId,
          },
        },
      })
      .catch(() => null);

    if (existingFollow) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // If there's an existing pending request outgoing
    const existingRequest = await prisma.followRequest
      .findUnique({
        where: { fromUserId_toUserId: { fromUserId, toUserId } },
      })
      .catch(() => null);

    if (existingRequest && existingRequest.status === 'pending') {
      return res.status(400).json({ error: 'Follow request already sent' });
    }

    // Create or upsert the follow request
    const request = await prisma.followRequest.upsert({
      where: { fromUserId_toUserId: { fromUserId, toUserId } },
      update: { status: 'pending', updatedAt: new Date() },
      create: {
        fromUserId,
        toUserId,
        status: 'pending',
      },
    });

    return res.status(201).json({ request });
  } catch (err) {
    console.error('sendFollowRequest error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.cancelFollowRequest = async (req, res) => {
  try {
    const fromUserId = req.user.id;
    const toUserId = parseInt(req.params.toUserId, 10);
    if (Number.isNaN(toUserId))
      return res.status(400).json({ error: 'Invalid user id' });

    const existing = await prisma.followRequest
      .findUnique({
        where: { fromUserId_toUserId: { fromUserId, toUserId } },
      })
      .catch(() => null);

    if (!existing || existing.status !== 'pending') {
      return res.status(404).json({ error: 'No pending request to cancel' });
    }

    await prisma.followRequest.delete({
      where: { id: existing.id },
    });

    return res.json({ message: 'Follow request cancelled' });
  } catch (err) {
    console.error('cancelFollowRequest error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getIncomingRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await prisma.followRequest.findMany({
      where: { toUserId: userId, status: 'pending' },
      orderBy: { createdAt: 'desc' },
      include: {
        from: {
          select: { id: true, username: true, name: true, profilePic: true },
        },
      },
    });
    return res.json({ requests });
  } catch (err) {
    console.error('getIncomingRequests error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getOutgoingRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await prisma.followRequest.findMany({
      where: { fromUserId: userId, status: 'pending' },
      orderBy: { createdAt: 'desc' },
      include: {
        to: {
          select: { id: true, username: true, name: true, profilePic: true },
        },
      },
    });
    return res.json({ requests });
  } catch (err) {
    console.error('getOutgoingRequests error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Respond to a follow request:
 * body: { action: 'accept' | 'reject' }
 */
exports.respondToRequest = async (req, res) => {
  try {
    const userId = req.user.id; // the recipient
    const requestId = parseInt(req.params.requestId, 10);
    const { action } = req.body;

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }
    if (Number.isNaN(requestId))
      return res.status(400).json({ error: 'Invalid request id' });

    const request = await prisma.followRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.toUserId !== userId) {
      return res.status(404).json({ error: 'Follow request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request already handled' });
    }

    if (action === 'reject') {
      const updated = await prisma.followRequest.update({
        where: { id: requestId },
        data: { status: 'rejected', updatedAt: new Date() },
      });
      return res.json({ request: updated });
    }

    // action === 'accept' -> create Follow and mark request accepted in a transaction
    const [follow] = await prisma.$transaction(async (tx) => {
      // create follow if not already exists
      const maybeFollow = await tx.follow.findUnique({
        where: {
          followerId_followedId: {
            followerId: request.fromUserId,
            followedId: request.toUserId,
          },
        },
      });

      if (maybeFollow) {
        // still update request status
        const updatedReq = await tx.followRequest.update({
          where: { id: requestId },
          data: { status: 'accepted', updatedAt: new Date() },
        });
        return [maybeFollow, updatedReq];
      }

      // create follow
      const createdFollow = await tx.follow.create({
        data: {
          followerId: request.fromUserId,
          followedId: request.toUserId,
          status: 'accepted',
        },
      });

      const updatedReq = await tx.followRequest.update({
        where: { id: requestId },
        data: { status: 'accepted', updatedAt: new Date() },
      });

      return [createdFollow, updatedReq];
    });

    return res.json({ follow });
  } catch (err) {
    console.error('respondToRequest error', err);
    // handle unique constraint violation gracefully
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Already following' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followedId = parseInt(req.params.followedId, 10);
    if (Number.isNaN(followedId))
      return res.status(400).json({ error: 'Invalid user id' });

    const existing = await prisma.follow
      .findUnique({
        where: { followerId_followedId: { followerId, followedId } },
      })
      .catch(() => null);

    if (!existing) {
      return res.status(404).json({ error: 'Not following' });
    }

    await prisma.follow.delete({
      where: { id: existing.id },
    });

    return res.json({ message: 'Unfollowed' });
  } catch (err) {
    console.error('unfollowUser error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (Number.isNaN(userId))
      return res.status(400).json({ error: 'Invalid user id' });

    const followers = await prisma.follow.findMany({
      where: { followedId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        follower: {
          select: { id: true, username: true, name: true, profilePic: true },
        },
      },
    });

    // return array of follower users
    const users = followers.map((f) => f.follower);
    return res.json({ users });
  } catch (err) {
    console.error('getFollowers error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (Number.isNaN(userId))
      return res.status(400).json({ error: 'Invalid user id' });

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        followed: {
          select: { id: true, username: true, name: true, profilePic: true },
        },
      },
    });

    const users = following.map((f) => f.followed);
    return res.json({ users });
  } catch (err) {
    console.error('getFollowing error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
