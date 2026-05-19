const mongoose = require('mongoose');

const ChatHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    messages: [
        {
            text: String,
            isBot: Boolean,
            createdAt: { type: Date, default: Date.now }
        }
    ],
    title: {
        type: String,
        default: () => `Chat ${new Date().toLocaleDateString('vi-VN')}`
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);
