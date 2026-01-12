// controllers/commentsController.js
import prisma from '../prismaClient.js';

export const createComment = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authorized' });

    const postId = parseInt(req.params.postId, 10);
    if (Number.isNaN(postId))
      return res.status(400).json({ error: 'Invalid post id' });

    const { content, parentId } = req.body;
    if (!content || typeof content !== 'string' || !content.trim())
      return res.status(400).json({ error: 'Content is required' });

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.deleted)
      return res.status(404).json({ error: 'Post not found' });

    let parent = null;
    if (parentId !== undefined && parentId !== null) {
      const pid = parseInt(parentId, 10);
      if (Number.isNaN(pid))
        return res.status(400).json({ error: 'Invalid parentId' });

      parent = await prisma.comment.findUnique({ where: { id: pid } });
      if (!parent)
        return res.status(404).json({ error: 'Parent comment not found' });
      if (parent.postId !== postId)
        return res
          .status(400)
          .json({ error: 'Parent comment belongs to different post' });
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: userId,
        content: content.trim(),
        parentId: parent ? parent.id : null,
      },
      include: {
        author: {
          select: { id: true, username: true, name: true, profilePic: true },
        },
      },
    });

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

    if (
      parent &&
      parent.authorId !== userId &&
      parent.authorId !== post.authorId
    ) {
      const replyNotif = {
        fromUserId: userId,
        fromUsername: req.user.username || req.user.name || null,
        postId,
        commentId: comment.id,
        parentCommentId: parent.id,
        excerpt: comment.content.slice(0, 160),
      };
      await prisma.notification.create({
        data: {
          userId: parent.authorId,
          type: 'comment_reply',
          data: replyNotif,
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

export const createReply = async (req, res) => {
  try {
    const parentId = parseInt(req.params.commentId, 10);
    if (Number.isNaN(parentId))
      return res.status(400).json({ error: 'Invalid parent comment id' });

    const parent = await prisma.comment.findUnique({
      where: { id: parentId },
      include: { post: true },
    });
    if (!parent)
      return res.status(404).json({ error: 'Parent comment not found' });

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authorized' });

    const { content } = req.body;
    if (!content || typeof content !== 'string' || !content.trim())
      return res.status(400).json({ error: 'Content is required' });

    const post = parent.post;
    if (!post || post.deleted)
      return res.status(404).json({ error: 'Post not found' });

    const comment = await prisma.comment.create({
      data: {
        postId: post.id,
        authorId: userId,
        content: content.trim(),
        parentId: parent.id,
      },
      include: {
        author: {
          select: { id: true, username: true, name: true, profilePic: true },
        },
      },
    });

    if (post.authorId !== userId) {
      const notifData = {
        fromUserId: userId,
        fromUsername: req.user.username || req.user.name || null,
        postId: post.id,
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

    if (parent.authorId !== userId && parent.authorId !== post.authorId) {
      const replyNotif = {
        fromUserId: userId,
        fromUsername: req.user.username || req.user.name || null,
        postId: post.id,
        commentId: comment.id,
        parentCommentId: parent.id,
        excerpt: comment.content.slice(0, 160),
      };
      await prisma.notification.create({
        data: {
          userId: parent.authorId,
          type: 'comment_reply',
          data: replyNotif,
          read: false,
        },
      });
    }

    return res.status(201).json({ comment });
  } catch (err) {
    console.error('createReply error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getComment = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

    const comment = await prisma.comment.findFirst({
      where: { id },
      include: {
        author: {
          select: { id: true, username: true, name: true, profilePic: true },
        },
        post: {
          select: {
            id: true,
            title: true,
            content: true,
            authorId: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                username: true,
                name: true,
                profilePic: true,
              },
            },
          },
        },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                name: true,
                profilePic: true,
              },
            },
          },
        },
      },
    });

    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    return res.json({ comment });
  } catch (err) {
    console.error('getComment error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const updateComment = async (req, res) => {
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

export const deleteComment = async (req, res) => {
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

    try {
      await prisma.notification.deleteMany({
        where: {
          OR: [
            { type: 'comment', AND: { userId: existing.post.authorId } },
            { type: 'comment_reply', AND: { userId: existing.post.authorId } },
          ],
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
