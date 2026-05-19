const nodemailer = require('nodemailer');

const sendResetEMail = async (email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        // Đường dẫn đặt lại mật khẩu ở Frontend
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

        const mailOptions = {
            from: `"EatDish Security" <${process.env.MAIL_USER}>`,
            to: email,
            subject: 'Yêu cầu khôi phục mật khẩu EatDish',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e1e1e1; border-radius: 12px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #d63031; margin: 0;">EatDish Security</h1>
                    </div>
                    
                    <h2 style="color: #333; text-align: center;">Khôi Phục Mật Khẩu</h2>
                    <p style="color: #555; line-height: 1.6; font-size: 16px;">
                        Hệ thống vừa nhận được yêu cầu đặt lại mật khẩu cho tài khoản EatDish liên kết với email này. Nếu đây là bạn, vui lòng nhấn vào nút bên dưới để tạo mật khẩu mới:
                    </p>
                    
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${resetUrl}" style="background-color: #d63031; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(214, 48, 49, 0.2);">
                            Đặt Lại Mật Khẩu
                        </a>
                    </div>
                    
                    <p style="color: #555; line-height: 1.6; font-size: 14px;">
                        Hoặc sử dụng đường link dự phòng sau:<br>
                        <a href="${resetUrl}" style="color: #d63031; word-break: break-all;">${resetUrl}</a>
                    </p>
                    
                    <div style="background-color: #fff3f3; border-left: 4px solid #d63031; padding: 15px; margin-top: 30px;">
                        <p style="color: #d63031; font-size: 13px; margin: 0;">
                            <strong>Cảnh báo:</strong> Link này chỉ có hiệu lực trong vòng <strong>15 phút</strong>. Nếu bạn không yêu cầu đổi mật khẩu, hệ thống của bạn vẫn an toàn. Vui lòng phớt lờ email này và không chia sẻ link cho bất kỳ ai.
                        </p>
                    </div>
                    
                    <p style="color: #888; font-size: 13px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
                        Đội ngũ Hỗ trợ EatDish
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent successfully to:', info.messageId);
        return true;

    } catch (error) {
        console.error('❌ Error sending reset password email:', error);
        throw new Error('Không thể gửi email khôi phục mật khẩu.');
    }
};

module.exports = sendResetEMail;