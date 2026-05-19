const express = require('express');
const router = express.Router();

// Import Auth Middleware
const { verifyToken } = require('../middleware/auth');

// Import Controller
const feedbackController = require('../controllers/feedbackController');

// Routes
router.post('/', verifyToken, feedbackController.createFeedback);

module.exports = router;
