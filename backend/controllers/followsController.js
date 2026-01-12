// controllers/followsController.js
import prisma from '../prismaClient.js';

export const createFollowRequestNotification = async ({
  toUserId,
  fromUserId,
  requestId,
}) => {
  const fromUser = await prisma.user.findUnique({
    where: { id: fromUserId },
    select: { id: true, username: true, name: true, profilePic: true },
  });

  const payload = {
    fromUserId,
    requestId,
    fromUsername: fromUser?.username || null,
    fromName: fromUser?.name || null,
    fromProfilePic: fromUser?.profilePic || null,
  };

  console.log('Creating notification for user', toUserId, 'payload', payload);

  return prisma.notification.create({
    data: {
      userId: toUserId,
      type: 'follow_request',
      data: payload,
    },
  });
};

export const removeFollowRequestNotification = async ({
  toUserId,
  fromUserId,
  requestId,
}) => {
  try {
    await prisma.notification.deleteMany({
      where: {
        userId: toUserId,
        type: 'follow_request',
        data: { equals: { fromUserId, requestId } },
      },
    });
  } catch (err) {
    console.warn('delete by exact JSON failed, trying fallback', err);
    await prisma.notification.deleteMany({
      where: {
        userId: toUserId,
        type: 'follow_request',
        OR: [{ data: { path: ['requestId'], equals: requestId } }, {}],
      },
    });
  }
};

export const sendFollowRequest = async (req, res) => {
  try {
    const fromUserId = req.user.id;
    const toUserId = parseInt(req.params.toUserId, 10);

    if (Number.isNaN(toUserId))
      return res.status(400).json({ error: 'Invalid user id' });
    if (toUserId === fromUserId)
      return res.status(400).json({ error: 'Cannot follow yourself' });

    const toUser = await prisma.user.findUnique({ where: { id: toUserId } });
    if (!toUser || toUser.deleted)
      return res.status(404).json({ error: 'User not found' });

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

    const existingRequest = await prisma.followRequest
      .findUnique({
        where: { fromUserId_toUserId: { fromUserId, toUserId } },
      })
      .catch(() => null);

    if (existingRequest && existingRequest.status === 'pending') {
      return res.status(400).json({ error: 'Follow request already sent' });
    }

    const request = await prisma.followRequest.upsert({
      where: { fromUserId_toUserId: { fromUserId, toUserId } },
      update: { status: 'pending', updatedAt: new Date() },
      create: {
        fromUserId,
        toUserId,
        status: 'pending',
      },
    });

    try {
      await createFollowRequestNotification({
        toUserId,
        fromUserId,
        requestId: request.id,
      });
    } catch (notifErr) {
      console.error('create notification failed', notifErr);
    }

    return res.status(201).json({ request });
  } catch (err) {
    console.error('sendFollowRequest error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const cancelFollowRequest = async (req, res) => {
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

    try {
      await removeFollowRequestNotification({
        toUserId,
        fromUserId,
        requestId: existing.id,
      });
    } catch (notifErr) {
      console.error('remove notification failed', notifErr);
    }

    return res.json({ message: 'Follow request cancelled' });
  } catch (err) {
    console.error('cancelFollowRequest error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getIncomingRequests = async (req, res) => {
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

export const getOutgoingRequests = async (req, res) => {
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

export const respondToRequest = async (req, res) => {
  try {
    const userId = req.user.id;
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

      try {
        await removeFollowRequestNotification({
          toUserId: request.toUserId,
          fromUserId: request.fromUserId,
          requestId: request.id,
        });
      } catch (notifErr) {
        console.error('remove notification after reject failed', notifErr);
      }

      return res.json({ request: updated });
    }

    const [follow, updatedReq] = await prisma.$transaction(async (tx) => {
      const maybeFollow = await tx.follow.findUnique({
        where: {
          followerId_followedId: {
            followerId: request.fromUserId,
            followedId: request.toUserId,
          },
        },
      });

      if (maybeFollow) {
        const updated = await tx.followRequest.update({
          where: { id: requestId },
          data: { status: 'accepted', updatedAt: new Date() },
        });
        return [maybeFollow, updated];
      }

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

    try {
      await removeFollowRequestNotification({
        toUserId: request.toUserId,
        fromUserId: request.fromUserId,
        requestId: request.id,
      });
    } catch (notifErr) {
      console.error('remove notification after accept failed', notifErr);
    }

    try {
      await prisma.notification.create({
        data: {
          userId: request.fromUserId,
          type: 'follow_accepted',
          data: { byUserId: request.toUserId, followId: follow.id ?? null },
        },
      });
    } catch (notifErr) {
      console.error('create accepted notification failed', notifErr);
    }

    return res.json({ follow });
  } catch (err) {
    console.error('respondToRequest error', err);
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Already following' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
};

export const unfollowUser = async (req, res) => {
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

    try {
      await prisma.followRequest.deleteMany({
        where: {
          fromUserId: followerId,
          toUserId: followedId,
          status: 'accepted',
        },
      });
    } catch (delErr) {
      console.error('Error cleaning up followRequest after unfollow', delErr);
    }

    return res.json({ message: 'Unfollowed' });
  } catch (err) {
    console.error('unfollowUser error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getFollowers = async (req, res) => {
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

    const users = followers.map((f) => f.follower);
    return res.json({ users });
  } catch (err) {
    console.error('getFollowers error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getFollowing = async (req, res) => {
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
