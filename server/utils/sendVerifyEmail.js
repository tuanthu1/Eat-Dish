const nodemailer = require('nodemailer');

const sendVerifyEmail = async (email, fullname, token) => {
    try {
        // Cấu hình transporter (Nhớ setup biến môi trường .env nhé)
        const transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        // Đường dẫn trả về Frontend của mày
        const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

        const mailOptions = {
            from: `"EatDish - Mạng Xã Hội Ẩm Thực" <${process.env.MAIL_USER}>`,
            to: email,
            subject: '🍳 Xác thực tài khoản EatDish của bạn',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e1e1e1; border-radius: 12px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #ff9f1c; margin: 0;">EatDish</h1>
                        <p style="color: #888; font-size: 14px; margin-top: 5px;">Khám phá và chia sẻ hương vị</p>
                    </div>
                    
                    <h2 style="color: #333; text-align: center;">Chào mừng bạn mới!</h2>
                    <p style="color: #555; line-height: 1.6; font-size: 16px;">
                        Cảm ơn bạn đã tham gia cộng đồng EatDish. Để bắt đầu chia sẻ những công thức tuyệt vời và trải nghiệm trợ lý nấu ăn AI, vui lòng xác thực địa chỉ email của bạn bằng cách nhấn vào nút dưới đây:
                    </p>
                    
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${verifyUrl}" style="background-color: #ff9f1c; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(255, 159, 28, 0.2);">
                            Xác Thực Email Ngay
                        </a>
                    </div>
                    
                    <p style="color: #555; line-height: 1.6; font-size: 14px;">
                        Hoặc bạn có thể sao chép và dán đường link này vào trình duyệt:<br>
                        <a href="${verifyUrl}" style="color: #ff9f1c; word-break: break-all;">${verifyUrl}</a>
                    </p>
                    
                    <p style="color: #888; font-size: 13px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                        * Link này sẽ hết hạn sau 24 giờ. Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email.<br>
                        Trân trọng,<br>
                        <strong>Đội ngũ EatDish</strong>
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        return true;
        
    } catch (error) {
        console.error('❌ Error sending verify email:', error);
        throw new Error('Không thể gửi email xác thực.');
    }
};

module.exports = sendVerifyEmail;