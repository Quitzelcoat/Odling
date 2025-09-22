// utils/fileUtils.js
const path = require('path');
const fsPromises = require('fs').promises;

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
      // remote URL — skip
      return;
    }

    const normalized = path.resolve(p);
    if (!normalized.startsWith(path.resolve(uploadsRoot))) return;

    await fsPromises.unlink(normalized).catch(() => {});
  } catch (err) {
    console.warn('safeUnlink failed', err?.message || err);
  }
}

module.exports = { safeUnlink };
