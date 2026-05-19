const express = require('express');
const router = express.Router();

// Import Controller
const webhookController = require('../controllers/webhookController');

// Routes
router.post('/payos', webhookController.handleWebhook);

module.exports = router;
