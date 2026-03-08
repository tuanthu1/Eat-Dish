const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const crypto = require('crypto');
const sendVerifyEmail = require('../utils/sendVerifyEmail');
const sendResetEmail = require('../utils/sendResetEmail');
// ĐĂNG KÝ TÀI KHOẢN MỚI 
exports.register = async (req, res) => {
    try {
        const { username, email, password, fullname, avatar } = req.body;

        if (!username || !email || !password || !fullname) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Email không hợp lệ" });
        }

        const [userExist] = await db.query(
            "SELECT id FROM users WHERE username = ? OR email = ?",
            [username, email]
        );
        if (userExist.length > 0) {
            return res.status(400).json({ message: "Username hoặc Email đã tồn tại" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const finalAvatar =
            avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullname)}`;

        const verifyToken = crypto.randomBytes(32).toString('hex');

        await db.query(
            `INSERT INTO users 
            (username,email,password,fullname,avatar,is_verified,email_verify_token)
            VALUES (?,?,?,?,?,0,?)`,
            [username, email, hashedPassword, fullname, finalAvatar, verifyToken]
        );

        await sendVerifyEmail(email, fullname, verifyToken);

        return res.json({
            status: 'success',
            message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.'
        });

    } catch (err) {
        console.error("Lỗi đăng ký:", err);
        res.status(500).json({ message: "Lỗi Server" });
    }
};


// ĐĂNG NHẬP 

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const [users] = await db.query("SELECT * FROM users WHERE username = ? or email = ?", [username, username]);
        if (users.length === 0) return res.status(404).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
        
        const user = users[0];

        if (!user.is_verified) {
            return res.status(403).json({ message: "Tài khoản chưa xác minh email." });
        }
        if (user.is_disabled) {
            return res.status(403).json({ message: "Tài khoản bị vô hiệu hóa!" });
        }
        let hasJustExpired = false;
        if (user.is_premium === 1 && user.premium_until) {
            const now = new Date();
            const expiry = new Date(user.premium_until);
            
            if (now > expiry) {
                hasJustExpired = true; 
                await db.query("UPDATE users SET is_premium = 0 WHERE id = ?", [user.id]);
                
                user.is_premium = 0; 
            }
        }

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).json({ message: "Sai mật khẩu" });

        const accessToken = jwt.sign(
            { id: user.id, role: user.role, is_premium: user.is_premium },
            process.env.JWT_SECRET || 'eatdish_secret_key',
            { expiresIn: '1d' }
        );

        const refreshToken = jwt.sign(
            { id: user.id }, 
            process.env.JWT_REFRESH_SECRET || 'eatdish_refresh_secret_key', 
            { expiresIn: '7d' }
        );

        await db.query("UPDATE users SET refresh_token = ? WHERE id = ?", [refreshToken, user.id]);
        const { password: _, ...userData } = user;
        return res.json({
            status: 'success',
            message: "Đăng nhập thành công",
            token: accessToken,       
            refreshToken: refreshToken, 
            user: {
                ...userData,
                is_premium: user.is_premium,
                premium_expired: hasJustExpired 
            }
        });
        
    } catch (err) {
        console.error("Login Error:", err);
        if (!res.headersSent) {
            res.status(500).json({ message: "Lỗi Đăng nhập server" });
        }
    }
};
// XỬ LÝ ĐĂNG NHẬP GOOGLE
exports.googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ message: "Không tìm thấy token từ Google." });
        }
        const googleResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const { email, name } = googleResponse.data;
        const [existingUsers] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        let user = existingUsers[0];
        if (!user) {
            const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-10), 10);
            
            // TẠO USERNAME: Eatdish_ + 6 số ngẫu nhiên (VD: Eatdish_482910)
            const randomNumber = Math.floor(100000 + Math.random() * 900000);
            const username = `Eatdish_${randomNumber}`;
            const randomAvatar = `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&size=128`;
            const insertQuery = `
                INSERT INTO users (fullname, username, email, password, avatar, role, is_premium) 
                VALUES (?, ?, ?, ?, ?, 'user', 0)
            `;
            
            const [result] = await db.query(insertQuery, [name, username, email, randomPassword, randomAvatar]);
            
            const [newUsers] = await db.query("SELECT * FROM users WHERE id = ?", [result.insertId]);
            user = newUsers[0];
        }
        const jwtSecret = process.env.JWT_SECRET || 'SECRET_KEY'; 
        const accessToken = jwt.sign(
            { id: user.id, role: user.role }, 
            jwtSecret, 
            { expiresIn: '1d' }
        );

        delete user.password;

        res.status(200).json({
            status: 'success',
            user: user,
            token: accessToken
        });

    } catch (error) {
        console.error("Lỗi Google Auth:", error.message);
        res.status(500).json({ message: "Xác thực Google thất bại." });
    }
};
// hàm đổi mật khẩu
exports.changePassword = async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;

        const [users] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: "Tài khoản không tồn tại." });
        }
        const user = users[0];

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu cũ không chính xác!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId]);

        res.json({ status: 'success', message: "Đổi mật khẩu thành công!" });

    } catch (err) {
        console.error("Lỗi đổi pass:", err);
        res.status(500).json({ message: "Lỗi Server: " + err.message });
    }
};

// hàm check 
exports.checkUser = async (req, res) => {
    const { username, email } = req.body;
    const [rows] = await db.query(
        "SELECT id FROM users WHERE username = ? OR email = ?",
        [username, email]
    );

    if (rows.length > 0) {
        return res.status(400).json({ message: "Username hoặc email đã tồn tại" });
    }

    res.json({ status: 'ok' });
};
// hàm xác thực
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Thiếu token" });
    }

    const [users] = await db.query(
      "SELECT id, is_verified FROM users WHERE email_verify_token = ?",
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({
        message: "Token không hợp lệ hoặc đã được sử dụng"
      });
    }

    await db.query(
      `UPDATE users
       SET is_verified = 1,
           email_verify_token = NULL
       WHERE id = ?`,
      [users[0].id]
    );

    return res.json({ message: "Xác minh email thành công" });

  } catch (err) {
    console.error("VERIFY EMAIL ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
// chức năng quên mật khảu
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Kiểm tra email tồn tại
        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: "Email không tồn tại trong hệ thống" });
        }

        // Tạo token reset
        const token = crypto.randomBytes(20).toString('hex');
        const expireTime = new Date(Date.now() + 3600000); // Hết hạn sau 1 tiếng 

        // Lưu token vào DB
        await db.query("UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?", [token, expireTime, email]);

        // Link reset 
        const resetUrl = `${process.env.DOMAIN}/reset-password?token=${token}`;

        // Gửi mail
        await sendResetEmail(email, resetUrl);

        res.json({ message: "Đã gửi link đặt lại mật khẩu vào email của bạn!" });   

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: "Lỗi gửi mail: " + error.message });
    }
};
// hàm đổi mật khẩu
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const [users] = await db.query(
            "SELECT * FROM users WHERE reset_token = ? AND reset_expires > NOW()", 
            [token]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: "Link không hợp lệ hoặc đã hết hạn" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.query(
            "UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?", 
            [hashedPassword, users[0].id]
        );

        res.json({ message: "Đặt lại mật khẩu thành công! Hãy đăng nhập ngay." });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: "Lỗi server: " + error.message });
    }
};
// Trả về thông tin thật sự dựa vào Token
exports.getMe = async (req, res) => {
    try {
        const [users] = await db.query("SELECT id, username, fullname, avatar, role, is_premium FROM users WHERE id = ?", [req.user.id]);
        
        if (users.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy" });
        }
        
        res.json({ user: users[0] });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server" });
    }
};