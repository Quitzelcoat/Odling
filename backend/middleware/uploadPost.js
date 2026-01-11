// middleware/uploadPost.js
const multer = require('multer');
const crypto = require('crypto');

const MAX_FILE_BYTES = 8 * 1024 * 1024;

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'), false);
  }
  cb(null, true);
}

const uploadPost = multer({
  storage,
  limits: { fileSize: MAX_FILE_BYTES },
  fileFilter,
});

module.exports = uploadPost;
