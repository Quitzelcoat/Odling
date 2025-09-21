// routes/pictureRoute.js
const express = require('express');
const router = express.Router();

const pictureController = require('../controllers/pictureController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Upload a new profile picture (form field: 'picture')
router.put(
  '/',
  authenticate,
  upload.single('picture'),
  pictureController.uploadProfilePicture
);

// Delete current profile picture
router.delete('/', authenticate, pictureController.deleteProfilePicture);

module.exports = router;
