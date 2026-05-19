const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const chatHistoryController = require('../controllers/chatHistoryController');

// Routes - đặt routes cụ thể trước các routes có parameters
router.post('/save', verifyToken, chatHistoryController.saveChat);
router.get('/detail/:chatId', verifyToken, chatHistoryController.getChatHistoryDetail);
router.delete('/user/:userId', verifyToken, chatHistoryController.deleteAllChats);
router.delete('/:chatId', verifyToken, chatHistoryController.deleteChat);
router.get('/:userId', verifyToken, chatHistoryController.getChatHistory);

module.exports = router;
