const db = require('../config/db');

// API lấy trạng thái bảo trì (Public)
exports.getMaintenanceStatus = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT maintenance_mode FROM settings LIMIT 1");
        const isMaintenance = rows.length > 0 ? rows[0].maintenance_mode === 1 : false;
        
        res.json({ isMaintenance });
    } catch (err) {
        console.error("Lỗi lấy trạng thái bảo trì:", err);
        res.status(500).json({ error: "Lỗi Server" });
    }
};

//API Bật/Tắt bảo trì (Chỉ Admin dùng)
exports.toggleMaintenanceStatus = async (req, res) => {
    try {
        const { status } = req.body; 
        const modeValue = status ? 1 : 0;

        const [rows] = await db.query("SELECT id FROM settings LIMIT 1");
        
        if (rows.length === 0) {
            await db.query("INSERT INTO settings (maintenance_mode) VALUES (?)", [modeValue]);
        } else {
            await db.query("UPDATE settings SET maintenance_mode = ?", [modeValue]);
        }

        res.json({ 
            success: true, 
            message: status ? "Đã BẬT chế độ bảo trì!" : "Đã TẮT chế độ bảo trì, web hoạt động bình thường!" 
        });
    } catch (err) {
        console.error("Lỗi bật/tắt bảo trì:", err);
        res.status(500).json({ error: "Lỗi Server" });
    }
};
// Cập nhật cài đặt thông báo
exports.updateNotificationSettings = async (req, res) => {
    try {
        const userId = req.user.id; // Lấy ID chuẩn từ Token
        const { email_tutorial, email_newsletter } = req.body;

        await db.query(
            "UPDATE users SET email_tutorial = ?, email_newsletter = ? WHERE id = ?",
            [email_tutorial ? 1 : 0, email_newsletter ? 1 : 0, userId]
        );

        res.json({ success: true, message: "Đã lưu cài đặt thông báo!" });
    } catch (err) {
        console.error("Lỗi lưu thông báo:", err);
        res.status(500).json({ message: "Lỗi Server khi lưu cài đặt" });
    }
};