const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
   

    if (!authHeader) {
        return res.status(401).json({ message: "Thiếu token" });
    }
     const token = authHeader && authHeader.split(' ')[1]; 
    if (!token) return res.status(401).json({ message: 'Vui lòng đăng nhập!' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        // Nếu lỗi là do hết hạn
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!" });
        }
        // Các lỗi token sai, token giả mạo...
        return res.status(401).json({ message: "Token không hợp lệ!" });
    }
};

module.exports = verifyToken;