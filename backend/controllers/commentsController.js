// controllers/commentsController.js
const prisma = require('../prismaClient');

exports.createComment = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authorized' });

    const postId = parseInt(req.params.postId, 10);
    if (Number.isNaN(postId))
      return res.status(400).json({ error: 'Invalid post id' });

    const { content, parentId } = req.body;
    if (!content || typeof content !== 'string' || !content.trim())
      return res.status(400).json({ error: 'Content is required' });

    // ensure post exists and not deleted
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.deleted)
      return res.status(404).json({ error: 'Post not found' });

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: userId,
        content: content.trim(),
        parentId: parentId || null,
      },
      include: {
        author: {
          select: { id: true, username: true, name: true, profilePic: true },
        },
      },
    });

    // create notification for post author (if not commenting on own post)
    if (post.authorId !== userId) {
      const notifData = {
        fromUserId: userId,
        fromUsername: req.user.username || req.user.name || null,
        postId,
        commentId: comment.id,
        excerpt: comment.content.slice(0, 160),
      };

      await prisma.notification.create({
        data: {
          userId: post.authorId,
          type: 'comment',
          data: notifData,
          read: false,
        },
      });
    }

    return res.status(201).json({ comment });
  } catch (err) {
    console.error('createComment error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authorized' });

    const commentId = parseInt(req.params.id, 10);
    if (Number.isNaN(commentId))
      return res.status(400).json({ error: 'Invalid comment id' });

    const { content } = req.body;
    if (content === undefined || typeof content !== 'string' || !content.trim())
      return res
        .status(400)
        .json({ error: 'Content must be a non-empty string' });

    const existing = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!existing) return res.status(404).json({ error: 'Comment not found' });
    if (existing.authorId !== userId)
      return res.status(403).json({ error: 'Not allowed' });

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { content: content.trim() },
      include: {
        author: {
          select: { id: true, username: true, name: true, profilePic: true },
        },
      },
    });

    return res.json({ comment: updated });
  } catch (err) {
    console.error('updateComment error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authorized' });

    const commentId = parseInt(req.params.id, 10);
    if (Number.isNaN(commentId))
      return res.status(400).json({ error: 'Invalid comment id' });

    const existing = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: true },
    });
    if (!existing) return res.status(404).json({ error: 'Comment not found' });
    if (existing.authorId !== userId)
      return res.status(403).json({ error: 'Not allowed' });

    await prisma.comment.delete({ where: { id: commentId } });

    // try to remove corresponding comment notification (best-effort)
    try {
      await prisma.notification.deleteMany({
        where: {
          type: 'comment',
          data: {
            equals: {
              fromUserId: userId,
              fromUsername: req.user.username || req.user.name || null,
              postId: existing.postId,
              commentId,
              excerpt: undefined,
            },
          },
        },
      });
    } catch (e) {
      // ignore
    }

    return res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('deleteComment error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
