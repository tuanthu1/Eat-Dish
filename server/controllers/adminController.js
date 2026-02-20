const e = require('express');
const db = require('../config/db');
const bcrypt = require('bcryptjs');
//  Lấy thống kê tổng quan
exports.getStats = async (req, res) => {
    try {
        const [users] = await db.query("SELECT COUNT(*) as count FROM users");
        const [recipes] = await db.query("SELECT COUNT(*) as count FROM recipes");
        const [posts] = await db.query("SELECT COUNT(*) as count FROM community_posts");
        
        res.json({
            users: users[0].count,
            recipes: recipes[0].count,
            posts: posts[0].count
        });
    } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
};

//  Lấy danh sách tất cả User
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query("SELECT id, username, fullname, email, role, is_premium, is_verified, created_at FROM users");
        res.json(users);
    } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
};

//  Xóa User (Ban)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM users WHERE id = ?", [id]);
        res.json({ message: "Đã xóa người dùng thành công" });
    } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
};
// Lấy danh sách tất cả góp ý
exports.getAllFeedbacks = async (req, res) => {
    try {
        const sql = `
            SELECT f.id, f.type, f.content, f.created_at, u.username, u.email, u.avatar
            FROM feedbacks f
            LEFT JOIN users u ON f.user_id = u.id
            ORDER BY f.created_at DESC
        `;

        const [results] = await db.query(sql);
        
        return res.status(200).json(results);
    } catch (err) {
        console.error("Lỗi SQL Get Feedbacks:", err);
        return res.status(500).json({ message: "Lỗi lấy danh sách góp ý." });
    }
};
// Xóa góp ý (Sau khi đã đọc xong)
exports.deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = "DELETE FROM feedbacks WHERE id = ?";
        
        await db.query(sql, [id]);
        
        return res.status(200).json({ message: "Đã xóa góp ý thành công." });
    } catch (err) {
        console.error("Lỗi SQL Delete Feedback:", err);
        return res.status(500).json({ message: "Không thể xóa góp ý này." });
    }
};

// lây tất cả công thức 
exports.getAllRecipes = async (req, res) => {
    try {
        const sql = `
            SELECT 
                r.id, 
                r.name AS title,
                r.img AS image_url,
                r.is_premium,
                r.status,
                r.ingredients,
                r.steps,
                r.calories,
                r.time,
                r.created_at,
                u.fullname AS author_name,
                u.id AS author_id
            FROM recipes r
            JOIN users u ON r.author_id = u.id
            WHERE r.status != 'pending'
            ORDER BY r.created_at DESC
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) {
        console.error("Lỗi SQL Get All Recipes:", err);
        res.status(500).json({ message: "Lỗi Server" });
    }
};
//Lấy bài viết cộng đồng 
exports.getCommunityPosts = async (req, res) => {
    try {
        const currentUserId = req.query.userId;
        const sql = `
            SELECT 
                cp.*, 
                u.fullname, 
                u.avatar, 
                u.username,
                (SELECT COUNT(*) FROM community_likes WHERE post_id = cp.id AND user_id = ?) > 0 AS is_liked
            FROM community_posts cp 
            JOIN users u ON cp.user_id = u.id 
            ORDER BY cp.created_at DESC
        `;

        const [posts] = await db.query(sql, [currentUserId || null]); 
        res.json(posts);
    } catch (err) {
        console.error("Lỗi lấy bài cộng đồng:", err);
        res.status(500).json({ message: "Lỗi Server" });
    }
};
// Xóa bài viết cộng đồng
exports.deleteCommunityPost = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM community_posts WHERE id = ?', [id]);
        
        // (Tùy chọn) Xóa luôn các bình luận thuộc về bài viết này
        await db.query('DELETE FROM community_comments WHERE post_id = ?', [id]); 

        res.status(200).json({ message: "Đã xóa bài viết thành công", success: true });
    } catch (error) {
        console.error("Lỗi khi xóa bài viết:", error);
        res.status(500).json({ message: "Lỗi server khi xóa bài viết" });
    }
};

//thêm/xóa premium cho công thức
exports.toggleRecipePremium = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_premium } = req.body; 

        await db.query("UPDATE recipes SET is_premium = ? WHERE id = ?", [is_premium, id]);
        
        res.json({ 
            status: 'success', 
            message: is_premium === 1 ? "Đã đặt làm món ăn VIP 👑" : "Đã hủy trạng thái VIP" 
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi cập nhật trạng thái món ăn" });
    }
};
// Xóa công thức
exports.deleteRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM recipes WHERE id = ?", [id]);
        res.json({ message: "Đã xóa bài viết" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
};
// kích hoạt / vô hiệu hóa người dùng
exports.toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentStatus } = req.body;
        const newStatus = currentStatus === 'active' ? 'banned' : 'active';

        await db.query("UPDATE users SET status = ? WHERE id = ?", [newStatus, id]);
        res.json({ message: "Cập nhật trạng thái thành công", newStatus });
    } catch (err) { res.status(500).json({ message: "Lỗi server" }); }
};
// Lấy dữ liệu tổng quan cho biểu đồ
exports.getDashboardStats = async (req, res) => {
    try {
        const [[{ userCount }]] = await db.query("SELECT COUNT(*) as userCount FROM users");
        const [[{ recipeCount }]] = await db.query("SELECT COUNT(*) as recipeCount FROM recipes");
        const [[{ feedbackCount }]] = await db.query("SELECT COUNT(*) as feedbackCount FROM feedback");

        const stats = [
            { name: 'Người dùng', count: userCount },
            { name: 'Công thức', count: recipeCount },
            { name: 'Góp ý', count: feedbackCount }
        ];

        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: "Lỗi lấy thống kê" });
    }
};
//  Admin cập nhật trạng thái Premium (Cấp hoặc Xóa)
exports.updateUserPremium = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_premium } = req.body; 

        await db.query("UPDATE users SET is_premium = ? WHERE id = ?", [is_premium, id]);
        
        res.json({ message: "Cập nhật thành công", userId: id, newStatus: is_premium });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
};
//
exports.toggleVerify = async (req, res) => {
    try {
        const userId = req.params.id;
        const { is_verified } = req.body; 

        const sql = "UPDATE users SET is_verified = ? WHERE id = ?";
        await db.query(sql, [is_verified, userId]);

        res.json({ 
            status: 'success', 
            message: is_verified === 1 ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản" 
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi cập nhật trạng thái xác minh" });
    }
};
// hàm xem bill chuyển khoản
exports.getAllPayments = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.order_id, p.amount, p.status, p.created_at, u.username, u.email 
            FROM payments p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.order_id DESC
        `);

        res.json(rows);
    } catch (error) {
        console.error("Lỗi lấy lịch sử giao dịch:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};
// reset mật khẩu
exports.resetPass = async (req, res) => {
    const userId = req.params.id;
    const { password }= req.body;
    if (!password) {
        return res.status(400).json("Thiếu mật khẩu mới!");
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const sql = "UPDATE users SET password = ? WHERE id = ?";
        db.query(sql, [hashedPassword, userId], (err) => {
            if (err){ 
                console.error(err);
                return res.status(500).json(err);
            }
            
        });
        return res.status(200).json("Reset thành công!");
    } catch (err) {
        console.error("Lỗi Server:", err);
        return res.status(500).json(err);
    }
};
// Thêm gói premium mới
exports.createPackage = async (req, res) => {
    try {
        const { name, price, duration_days, description, benefits } = req.body;
        await db.query(
            "INSERT INTO premium_packages (name, price, duration_days, benefits, description) VALUES (?, ?, ?, ?, ?)",
            [name, price, duration_days, benefits, description]
        );
        res.json({ message: "Tạo gói thành công!" });
    } catch (err) { res.status(500).json({ message: "Lỗi tạo gói" }); }
};

// Xóa gói premium
exports.deletePackage = async (req, res) => {
    try {
        await db.query("UPDATE premium_packages SET is_active = 0 WHERE id = ?", [req.params.id]);
        res.json({ message: "Đã xóa gói cước" });
    } catch (err) { res.status(500).json({ message: "Lỗi xóa gói" }); }
};
// Cập nhật gói cước
exports.updatePackage = async (req, res) => {
    const { id } = req.params;
    const { name, price, duration_days, description, benefits } = req.body;
    try {
        await db.query(
            "UPDATE premium_packages SET name=?, price=?, duration_days=?, benefits?, description=? WHERE id=?", 
            [name, price, duration_days, benefits, description, id]
        );
        res.json({ message: "Cập nhật thành công" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi cập nhật gói cước" });
        console.log(err)
    }
};
//  Lấy danh sách mã
exports.getAllCoupons = async (req, res) => {
    try {
        const [coupons] = await db.query("SELECT * FROM discount_codes ORDER BY id DESC");
        res.json(coupons);
    } catch (err) {
        res.status(500).json({ message: "Lỗi lấy danh sách mã" });
    }
};

// Tạo mã giảm giá
exports.createCoupon = async (req, res) => {
    try {
        let { code, percent, expiry_date } = req.body;

        // Nếu không nhập code -> Tự Random
        if (!code) {
            // Tạo chuỗi ngẫu nhiên 6 ký tự (VD: DIS-A1B2)
            const randomStr = Math.random().toString(36).substring(3, 6).toUpperCase();
            code = `SALE${percent}-${randomStr}`;
        }

        await db.query(
            "INSERT INTO discount_codes (code, percent, expiry_date, is_active) VALUES (?, ?, ?, 1)",
            [code.toUpperCase(), percent, expiry_date]
        );

        res.status(201).json({ message: "Tạo mã thành công", code: code.toUpperCase() });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Mã giảm giá này đã tồn tại!" });
        }
        res.status(500).json({ message: "Lỗi tạo mã" });
    }
};

// Xóa mã giảm giá
exports.deleteCoupon = async (req, res) => {
    try {
        await db.query("DELETE FROM discount_codes WHERE id = ?", [req.params.id]);
        res.json({ message: "Đã xóa mã giảm giá" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi xóa mã" });
    }
};
// sửa mã giảm giá
exports.updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, percent, expiry_date } = req.body;
        if (!code || !percent) {
            return res.status(400).json({ message: "Thiếu thông tin mã hoặc phần trăm giảm" });
        }
        const sql = "UPDATE discount_codes SET code = ?, percent = ?, expiry_date = ? WHERE id = ?";
        await db.query(sql, [code, percent, expiry_date || null, id]);

        res.json({ message: "Cập nhật mã giảm giá thành công!" });
    } catch (error) {
        console.error("Lỗi update coupon:", error);
        res.status(500).json({ message: "Lỗi server khi cập nhật mã" });
    }
};
// Đổi trạng thái mã giảm giá 
exports.toggleCouponStatus = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("UPDATE discount_codes SET is_active = NOT is_active WHERE id = ?", [id]);
        res.json({ message: "Đã cập nhật trạng thái mã giảm giá" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi cập nhật trạng thái" });
    }
};
// lấy mã giảm giả để báo cáo
exports.getCoupons = async (req, res) => {
    try {
        const sql = `
            SELECT c.*, 
            (SELECT COUNT(*) FROM payments p WHERE p.coupon_code = c.code AND p.status = 'success') as used_count 
            FROM discount_codes c 
            ORDER BY c.created_at DESC
        `;
        
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi tải danh sách mã" });
    }
};