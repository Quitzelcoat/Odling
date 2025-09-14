// routes/notificationRoute.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

router.get('/', authenticate, notificationController.listNotifications);
router.post('/', authenticate, notificationController.createNotification);
router.post('/:id/read', authenticate, notificationController.markAsRead);
router.post('/mark-all-read', authenticate, notificationController.markAllRead);
router.delete('/:id', authenticate, notificationController.deleteNotification);

module.exports = router;
