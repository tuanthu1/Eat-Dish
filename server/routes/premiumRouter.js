const express = require('express');
const router = express.Router();
const premiumController = require('../controllers/premiumController');
const auth = require('../middleware/auth');
router.get('/packages', premiumController.getAllPackages);
router.get('/status', auth, premiumController.getUserPremiumStatus);
module.exports = router;