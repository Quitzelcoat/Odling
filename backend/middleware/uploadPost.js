// middleware/uploadPost.js
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const MAX_FILE_BYTES = 8 * 1024 * 1024; // allow up to 8MB for post images (adjust if needed)

const UPLOAD_ROOT = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '..', 'uploads');

const POST_DIR = path.join(UPLOAD_ROOT, 'post-images');

if (!fs.existsSync(POST_DIR)) {
  fs.mkdirSync(POST_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, POST_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const rnd = crypto.randomBytes(6).toString('hex');
    cb(null, `${Date.now()}-${rnd}${ext}`);
  },
});

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
