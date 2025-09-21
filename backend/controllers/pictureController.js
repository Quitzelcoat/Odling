// controllers/pictureController.js
const path = require('path');
const fsPromises = require('fs').promises;
const prisma = require('../prismaClient');

async function safeUnlink(fileUrlOrPath) {
  if (!fileUrlOrPath) return;
  try {
    const uploadsRoot =
      process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');

    let p = fileUrlOrPath;
    if (p.startsWith('/uploads')) {
      p = path.join(uploadsRoot, p.replace(/^\/uploads\/?/, ''));
    } else if (!path.isAbsolute(p) && p.includes('uploads')) {
      p = path.join(uploadsRoot, p.replace(/^uploads\/?/, ''));
    } else if (p.startsWith('http')) {
      return;
    }

    const normalized = path.resolve(p);
    if (!normalized.startsWith(path.resolve(uploadsRoot))) return;

    await fsPromises.unlink(normalized).catch(() => {});
  } catch (err) {
    console.warn('safeUnlink failed', err?.message || err);
  }
}

exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authorized' });

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileRelPath = path.join(
      '/uploads',
      'profile-pics',
      req.file.filename
    );

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user?.profilePic) {
      await safeUnlink(user.profilePic);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { profilePic: fileRelPath },
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

    if (user.profilePic) {
      await safeUnlink(user.profilePic);
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
