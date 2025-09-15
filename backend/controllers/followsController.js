const prisma = require('../prismaClient');

const createFollowRequestNotification = async ({
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
    requestId, // include sender username & name so frontend can display a friendly message

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

const removeFollowRequestNotification = async ({
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

    // create a notification for the target user (recipient)
    try {
      await createFollowRequestNotification({
        toUserId,
        fromUserId,
        requestId: request.id,
      });
    } catch (notifErr) {
      console.error('create notification failed', notifErr);
      // don't fail the main flow if notification creation fails
    }

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

    // delete the follow request
    await prisma.followRequest.delete({
      where: { id: existing.id },
    });

    // remove the notification that was created for the recipient
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
    const userId = req.user.id; // the recipient (the one who got the request)
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

      // remove original follow_request notification for recipient (handled)
      try {
        await removeFollowRequestNotification({
          toUserId: request.toUserId,
          fromUserId: request.fromUserId,
          requestId: request.id,
        });
      } catch (notifErr) {
        console.error('remove notification after reject failed', notifErr);
      }

      // optionally create a "rejected" notification for requester - skipped for now

      return res.json({ request: updated });
    }

    // action === 'accept' -> create Follow and mark request accepted in a transaction
    const [follow, updatedReq] = await prisma.$transaction(async (tx) => {
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
        const updated = await tx.followRequest.update({
          where: { id: requestId },
          data: { status: 'accepted', updatedAt: new Date() },
        });
        return [maybeFollow, updated];
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

    // Remove the follow_request notification (recipient handled it)
    try {
      await removeFollowRequestNotification({
        toUserId: request.toUserId,
        fromUserId: request.fromUserId,
        requestId: request.id,
      });
    } catch (notifErr) {
      console.error('remove notification after accept failed', notifErr);
    }

    // create a notification for the requester to tell them their request was accepted
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
