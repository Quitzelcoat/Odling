// controllers/postsController.js
import prisma from '../prismaClient.js';
import cloudinary from '../config/cloudinary.js';

export const createPost = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authorized' });

    const { title, content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length < 1) {
      return res.status(400).json({ error: 'Content is required' });
    }

    let imageUrl = null;
    if (req.file) {
      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: 'post-images',
              transformation: [{ width: 1200, height: 630, crop: 'limit' }],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(req.file.buffer);
      });
      imageUrl = result.secure_url;
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        title: title && typeof title === 'string' ? title.trim() : null,
        authorId: userId,
        image: imageUrl,
      },
    });

    return res.status(201).json({ post });
  } catch (err) {
    console.error('createPost error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getPosts = async (req, res) => {
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

export const getPost = async (req, res) => {
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

export const updatePost = async (req, res) => {
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
    const removeImage =
      req.body.removeImage === '1' || req.body.removeImage === 'true';

    if (content !== undefined) {
      if (!content || typeof content !== 'string' || !content.trim()) {
        return res
          .status(400)
          .json({ error: 'Content must be a non-empty string' });
      }
    }

    let imageUrl = existing.image;

    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (existing.image) {
        const publicId = existing.image
          .replace('https://res.cloudinary.com/', '')
          .split('/')[1]
          .split('.')[0];
        await cloudinary.uploader.destroy(publicId).catch(() => {});
      }

      // Upload new image to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: 'post-images',
              transformation: [{ width: 1200, height: 630, crop: 'limit' }],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(req.file.buffer);
      });
      imageUrl = result.secure_url;
    } else if (removeImage) {
      // Delete image from Cloudinary
      if (existing.image) {
        const publicId = existing.image
          .replace('https://res.cloudinary.com/', '')
          .split('/')[1]
          .split('.')[0];
        await cloudinary.uploader.destroy(publicId).catch(() => {});
      }
      imageUrl = null;
    }

    const data = {};
    if (content !== undefined) data.content = content.trim();
    if (req.body.title !== undefined) {
      data.title =
        req.body.title && typeof req.body.title === 'string'
          ? req.body.title.trim()
          : null;
    }
    data.image = imageUrl;

    const updated = await prisma.post.update({
      where: { id },
      data,
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

export const deletePost = async (req, res) => {
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

    // Delete image from Cloudinary if present
    if (existing.image) {
      const publicId = existing.image
        .replace('https://res.cloudinary.com/', '')
        .split('/')[1]
        .split('.')[0];
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }

    // Delete child records then post
    await prisma.$transaction(async (tx) => {
      await tx.like.deleteMany({ where: { postId: id } });
      await tx.comment.deleteMany({ where: { postId: id } });
      await tx.post.delete({ where: { id } });
    });

    return res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('deletePost error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
