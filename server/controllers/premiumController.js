const db = require('../config/db');

// Lấy danh sách gói 
exports.getAllPackages = async (req, res) => {
    try {
        const [packages] = await db.query("SELECT * FROM premium_packages WHERE is_active = 1");
        res.json(packages);
    } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
};

// lấy ngày hết hạn
exports.getUserPremiumStatus = async (req, res) => {
    try {
        const userId = req.user?.id; 
        
        if (!userId) {
            return res.status(401).json({ message: "Vui lòng đăng nhập!" });
        }

        const [users] = await db.query(
            "SELECT is_premium, premium_until FROM users WHERE id = ?", 
            [userId]
        );
        
        if (users.length > 0) {
            res.json(users[0]); 
        } else {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
    } catch (err) { 
        console.error("Lỗi lấy thông tin VIP:", err);
        res.status(500).json({ message: "Lỗi server" }); 
    }
};