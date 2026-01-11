// controllers/pictureController.js
const cloudinary = require('../config/cloudinary');
const prisma = require('../prismaClient');

exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authorized' });

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'profile-pics',
            transformation: [{ width: 300, height: 300, crop: 'limit' }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(req.file.buffer);
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Delete old image from Cloudinary if exists (FIXED publicId extraction)
    if (user?.profilePic) {
      const publicId = user.profilePic
        .replace('https://res.cloudinary.com/', '')
        .split('/')[1]
        .split('.')[0];
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { profilePic: result.secure_url },
      select: { id: true, username: true, name: true, profilePic: true },
    });

    return res.json({ user: updated });
  } catch (err) {
    console.error('uploadProfilePicture error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteProfilePicture = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Delete image from Cloudinary if exists (FIXED publicId extraction)
    if (user.profilePic) {
      const publicId = user.profilePic
        .replace('https://res.cloudinary.com/', '')
        .split('/')[1]
        .split('.')[0];
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { profilePic: null },
      select: { id: true, username: true, name: true, profilePic: true },
    });

    return res.json({ user: updated });
  } catch (err) {
    console.error('deleteProfilePicture error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
