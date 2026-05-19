const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

const verifyToken = (req, res, next) => {
    const token = req.cookies.accessToken || req.cookies.token; 
    const jwtSecret = process.env.JWT_SECRET || 'eatdish_secret_key';

    if (!token) {
        return res.status(401).json({ message: "Thiếu token, vui lòng đăng nhập!" });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded; // Dịch token xong nhét vào req.user
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            res.clearCookie('accessToken');
            res.clearCookie('token');
            return res.status(401).json({ message: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!" });
        }
        return res.status(401).json({ message: "Token không hợp lệ!" });
    }
};

const verifyTokenOptional = (req, res, next) => {
    const token = req.cookies.accessToken || req.cookies.token;
    const jwtSecret = process.env.JWT_SECRET || 'eatdish_secret_key';

    if (!token) return next();

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
    } catch (err) {
        // Optional check: clear stale cookies and continue as guest.
        res.clearCookie('accessToken');
        res.clearCookie('token');
    }

    return next();
};

const checkAdmin = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Thiếu thông tin người dùng trong token!" });
        }

        // Always verify role from DB to prevent trusting tampered client storage or stale token role.
        const dbUser = await User.findById(req.user.id).select('role');
        if (dbUser?.role === 'admin') {
            return next();
        }

        return res.status(403).json({ message: "Từ chối truy cập: Bạn không có quyền Admin!" });
    } catch (err) {
        return res.status(500).json({ message: "Lỗi kiểm tra quyền Admin!" });
    }
};
module.exports = { 
    verifyToken, 
    verifyTokenOptional,
    checkAdmin 
};