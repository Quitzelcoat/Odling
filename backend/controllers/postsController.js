const prisma = require('../prismaClient');
const path = require('path');
const { safeUnlink } = require('../middleware/fileUtils');

exports.createPost = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authorized' });

    const { title, content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length < 1) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const imagePath = req.file
      ? path.posix.join('/uploads', 'post-images', req.file.filename)
      : null;

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        title: title && typeof title === 'string' ? title.trim() : null,
        authorId: userId,
        image: imagePath,
      },
    });

    return res.status(201).json({ post });
  } catch (err) {
    console.error('createPost error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { deleted: false },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, username: true, name: true, profilePic: true },
        },
        _count: { select: { comments: true, likes: true } },
      },
    });
    return res.json({ posts });
  } catch (err) {
    console.error('getPosts error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getPost = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

    const post = await prisma.post.findFirst({
      where: { id, deleted: false },
      include: {
        author: {
          select: { id: true, username: true, name: true, profilePic: true },
        },
        comments: {
          where: {},
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
        _count: { select: { comments: true, likes: true } },
      },
    });

    if (!post) return res.status(404).json({ error: 'Post not found' });
    return res.json({ post });
  } catch (err) {
    console.error('getPost error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authorized' });

    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing || existing.deleted)
      return res.status(404).json({ error: 'Post not found' });
    if (existing.authorId !== userId)
      return res.status(403).json({ error: 'Not allowed' });

    // We support:
    // - JSON body { content, title, removeImage } (when not uploading new file)
    // - multipart/form-data with optional file field 'image' (handled by multer in route)
    const { content } = req.body;
    const removeImage =
      req.body.removeImage === '1' || req.body.removeImage === 'true';

    // require content to be non-empty when provided
    if (content !== undefined) {
      if (!content || typeof content !== 'string' || !content.trim()) {
        return res
          .status(400)
          .json({ error: 'Content must be a non-empty string' });
      }
    }

    // prepare update data
    const data = {};
    if (content !== undefined) data.content = content.trim();
    if (req.body.title !== undefined) {
      data.title =
        req.body.title && typeof req.body.title === 'string'
          ? req.body.title.trim()
          : null;
    }

    if (req.file) {
      // new image uploaded: prepare path, and schedule old image for removal
      data.image = path.posix.join(
        '/uploads',
        'post-images',
        req.file.filename
      );
    } else if (removeImage) {
      data.image = null;
    }

    const updated = await prisma.post.update({
      where: { id },
      data,
      include: {
        author: {
          select: { id: true, username: true, name: true, profilePic: true },
        },
      },
    });

    // If we replaced/removed an existing image — remove file from disk (best-effort)
    if ((req.file || removeImage) && existing.image) {
      await safeUnlink(existing.image);
    }

    return res.json({ post: updated });
  } catch (err) {
    console.error('updatePost error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authorized' });

    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing || existing.deleted)
      return res.status(404).json({ error: 'Post not found' });
    if (existing.authorId !== userId)
      return res.status(403).json({ error: 'Not allowed' });

    // Delete child records then post (hard delete). After success, remove image on disk.
    await prisma.$transaction(async (tx) => {
      await tx.like.deleteMany({ where: { postId: id } });
      await tx.comment.deleteMany({ where: { postId: id } });
      await tx.post.delete({ where: { id } });
    });

    // remove image file if present (best-effort)
    if (existing.image) {
      await safeUnlink(existing.image);
    }

    return res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('deletePost error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
