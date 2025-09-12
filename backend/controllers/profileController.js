// controllers/profileController.js
const bcrypt = require('bcrypt');
const prisma = require('../prismaClient'); // ensure this path is correct
const SALT_ROUNDS = 10;

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    // Allowed fields to update
    const { name, bio, username, profilePic, email, password } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (bio !== undefined) data.bio = bio || null;
    if (username !== undefined) data.username = username;
    if (profilePic !== undefined) data.profilePic = profilePic || null;
    if (email !== undefined) data.email = email;
    if (password !== undefined && password !== '') {
      data.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    // Nothing to update
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'No profile fields provided' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      // send back safe fields only
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        bio: true,
        profilePic: true,
      },
    });

    return res.json({ message: 'Profile updated', user: updated });
  } catch (err) {
    // handle unique constraint error (Prisma P2002)
    if (err && err.code === 'P2002') {
      const target = err.meta?.target?.join(', ') || 'field';
      return res.status(409).json({ error: `${target} already in use` });
    }
    console.error('updateProfile error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
