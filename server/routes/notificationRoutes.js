const express = require('express');
const router = express.Router();

// Import Auth Middleware
const { verifyToken } = require('../middleware/auth');

// Import Controller
const notificationController = require('../controllers/notificationController');

// Routes
router.get('/:userId', verifyToken, notificationController.getUserNotifications);
router.post('/mark-as-read', verifyToken, notificationController.markAsRead);

module.exports = router;
