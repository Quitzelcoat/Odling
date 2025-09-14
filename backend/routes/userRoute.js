// routes/userRoute.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// public: get user by numeric id (e.g. /users/123)
router.get('/:id', userController.getUserById);

// public: search users by query (username, name, or custom userId string)
router.get('/', userController.searchUsers);

module.exports = router;
