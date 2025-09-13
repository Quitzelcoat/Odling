// controllers/postsController.js
const prisma = require('../prismaClient');

// controllers/postsController.js (createPost)
exports.createPost = async (req, res) => {
  try {
    console.log('>>> createPost called:', {
      user: req.user?.id,
      body: req.body,
    });

    const userId = req.user?.id;
    if (!userId) {
      console.log('>>> createPost: unauthenticated');
      return res.status(401).json({ error: 'Not authorized' });
    }

    const { title, content } = req.body;
    console.log('>>> title:', title, 'content:', content);

    if (!content || typeof content !== 'string' || content.trim().length < 1) {
      console.log('>>> createPost validation failed');
      return res.status(400).json({ error: 'Content is required' });
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        title: title && typeof title === 'string' ? title.trim() : null,
        authorId: userId,
      },
    });

    console.log('>>> created post id:', post.id);
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
          where: {}, // you can add pagination / ordering here
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

    const { content } = req.body;
    if (content === undefined)
      return res.status(400).json({ error: 'No fields to update' });
    if (!content || typeof content !== 'string' || content.trim().length < 1) {
      return res
        .status(400)
        .json({ error: 'Content must be a non-empty string' });
    }

    const updated = await prisma.post.update({
      where: { id },
      data: { content: content.trim() },
      include: {
        author: {
          select: { id: true, username: true, name: true, profilePic: true },
        },
      },
    });

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

    // Soft delete (set deleted = true)
    await prisma.post.update({ where: { id }, data: { deleted: true } });

    return res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('deletePost error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
