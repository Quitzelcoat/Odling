const express = require('express');
const router = express.Router();

const { updateProfile } = require('../controllers/profileController');
const { authenticate } = require('../middleware/auth');

// protected update profile
router.put('/profile', authenticate, updateProfile);

module.exports = router;
