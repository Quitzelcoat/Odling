const express = require('express');
const router = express.Router();

const { signUp, login, logout } = require('../controllers/authController');
const { guestOnly } = require('../middleware/auth');

router.post('/signup', guestOnly, signUp);
router.post('/login', guestOnly, login);
router.post('/logout', logout);

module.exports = router;
