const express = require('express');
const router = express.Router();

const {
  signUp,
  login,
  logout,
  getMe,
  guestLogin,
} = require('../controllers/authController');
const { guestOnly, authenticate } = require('../middleware/auth');

router.post('/signup', guestOnly, signUp);
router.post('/login', guestOnly, login);
router.post('/logout', logout);
router.post('/guest', guestLogin);
router.get('/me', authenticate, getMe);

module.exports = router;
