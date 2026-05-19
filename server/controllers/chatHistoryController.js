const ChatHistory = require('../models/ChatHistory');

// Lấy lịch sử chat của user
exports.getChatHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const chatHistories = await ChatHistory.find({ user: userId })
            .sort({ updatedAt: -1 })
            .select('_id title createdAt updatedAt');
        
        res.json(chatHistories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lấy chi tiết 1 lịch sử chat
exports.getChatHistoryDetail = async (req, res) => {
    try {
        const { chatId } = req.params;
        const chatHistory = await ChatHistory.findById(chatId);
        
        if (!chatHistory) {
            return res.status(404).json({ error: 'Không tìm thấy lịch sử chat' });
        }
        
        res.json(chatHistory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lưu/cập nhật lịch sử chat
exports.saveChat = async (req, res) => {
    try {
        const { userId, messages, title } = req.body;
        
        if (!messages || messages.length === 0) {
            return res.status(400).json({ error: 'Không có tin nhắn để lưu' });
        }

        // Tìm hoặc tạo mới chat history
        let chatHistory = await ChatHistory.findOne({ user: userId });
        
        if (chatHistory) {
            // Cập nhật nếu đã tồn tại
            chatHistory.messages = messages;
            chatHistory.title = title || chatHistory.title;
            chatHistory.updatedAt = new Date();
        } else {
            // Tạo mới
            chatHistory = new ChatHistory({
                user: userId,
                messages,
                title: title || `Chat ${new Date().toLocaleDateString('vi-VN')}`
            });
        }

        await chatHistory.save();
        res.json({ success: true, chatId: chatHistory._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Xóa lịch sử chat
exports.deleteChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        await ChatHistory.findByIdAndDelete(chatId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Xóa tất cả lịch sử chat của user
exports.deleteAllChats = async (req, res) => {
    try {
        const { userId } = req.params;
        await ChatHistory.deleteMany({ user: userId });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
