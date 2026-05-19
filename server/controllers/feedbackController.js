const Notification = require('../models/Notification');
const Feedback = require('../models/Feedback');
const ActivityLog = require('../models/ActivityLogModel');

// hàm tạo feedback gửi về cho admin
exports.createFeedback = async (req, res) => { 
    const { userId, type, content } = req.body;

    try {
        await Feedback.create({
            user: userId,
            type,
            content
        });
        await ActivityLog.create({
            username: req.user?.username || 'anonymous',
            action: "Người dùng đã gửi một góp ý mới với nội dung: " + content.substring(0, 30) + "..."
        });
        await Notification.create({
            user: userId,
            type: 'feedback',
            message: `Cảm ơn bạn đã gửi góp ý! Chúng tôi sẽ xem xét và phản hồi sớm nhất có thể.`
        });
        return res.status(200).json({
            status: 'success',
            message: "Gửi góp ý thành công!"
        });
        
    } catch (err) {
        console.error("Lỗi SQL:", err);
        return res.status(500).json({ message: "Lỗi lưu vào Database" });
    }
};