const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const auth = require('../middleware/auth');
router.get('/maintenance', settingController.getMaintenanceStatus);

router.post('/maintenance/toggle', settingController.toggleMaintenanceStatus);
router.put('/notifications',auth ,settingController.updateNotificationSettings);
module.exports = router;