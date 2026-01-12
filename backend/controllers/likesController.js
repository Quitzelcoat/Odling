// controllers/likesController.js
import prisma from '../prismaClient.js';

export const checkLiked = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authorized' });

    const postId = parseInt(req.params.id || req.params.postId, 10);
    if (Number.isNaN(postId))
      return res.status(400).json({ error: 'Invalid post id' });

    const existing = await prisma.like
      .findUnique({
        where: { userId_postId: { userId, postId } },
      })
      .catch(() => null);

    return res.json({ liked: Boolean(existing) });
  } catch (err) {
    console.error('checkLiked error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const likePost = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authorized' });

    const postId = parseInt(req.params.id || req.params.postId, 10);
    if (Number.isNaN(postId))
      return res.status(400).json({ error: 'Invalid post id' });

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.deleted)
      return res.status(404).json({ error: 'Post not found' });

    // Prevent liking your own post if you want (optional). We'll allow but skip notification.
    const existing = await prisma.like
      .findUnique({
        where: { userId_postId: { userId, postId } },
      })
      .catch(() => null);

    if (existing) {
      return res.status(400).json({ error: 'Already liked' });
    }

    const like = await prisma.like.create({
      data: { userId, postId },
    });

    // create a notification for the post author (if not liker)
    if (post.authorId !== userId) {
      const notifData = {
        fromUserId: userId,
        fromUsername: req.user.username || req.user.name || null,
        postId,
      };
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          type: 'like',
          data: notifData,
          read: false,
        },
      });
    }

    // return new counts
    const counts = await prisma.post.findUnique({
      where: { id: postId },
      select: { _count: { select: { likes: true, comments: true } } },
    });

    return res.json({ like, counts });
  } catch (err) {
    console.error('likePost error', err);
    if (err.code === 'P2002')
      return res.status(400).json({ error: 'Already liked' });
    return res.status(500).json({ error: 'Server error' });
  }
};

export const unlikePost = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authorized' });

    const postId = parseInt(req.params.id || req.params.postId, 10);
    if (Number.isNaN(postId))
      return res.status(400).json({ error: 'Invalid post id' });

    const existing = await prisma.like
      .findUnique({
        where: { userId_postId: { userId, postId } },
      })
      .catch(() => null);

    if (!existing) return res.status(404).json({ error: 'Like not found' });

    await prisma.like.delete({ where: { id: existing.id } });

    // Try to remove the corresponding 'like' notification (exact JSON match)
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true },
      });

      const notifData = {
        fromUserId: userId,
        fromUsername: req.user.username || req.user.name || null,
        postId,
      };
      await prisma.notification.deleteMany({
        where: {
          userId: post.authorId,
          type: 'like',
          data: { equals: notifData },
        },
      });
    } catch (e) {
      // ignore errors removing notification (not critical)
      console.warn('could not remove like notification', e);
    }

    // return new counts
    const counts = await prisma.post.findUnique({
      where: { id: postId },
      select: { _count: { select: { likes: true, comments: true } } },
    });

    return res.json({ message: 'Unliked', counts });
  } catch (err) {
    console.error('unlikePost error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
