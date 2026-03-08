const crypto = require("crypto");
const db = require("../config/db");

exports.handleWebhook = async (req, res) => {
    try {
        const body = req.body;
        // Trường hợp PayOS Test Connection ( data null hoặc rỗng)
        if (!body || !body.data) {
            console.log("✅ PayOS Test Connection OK");
            return res.json({ success: true });
        }

        const { data, signature } = body;
        const { amount, description, orderCode, status } = data;

        // Tạo chữ ký để kiểm tra 
        const rawSignature = `amount=${amount}&description=${description}&orderCode=${orderCode}&status=${status}`;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.PAYOS_CHECKSUM_KEY)
            .update(rawSignature)
            .digest("hex");

        if (expectedSignature !== signature) {
            console.error("LỖI: Chữ ký không khớp!");
            console.log("   - Chữ ký nhận được:", signature);
            console.log("   - Chữ ký tính toán:", expectedSignature);
            console.log("   - Raw String:", rawSignature);
            console.log("   - Checksum Key:", process.env.PAYOS_CHECKSUM_KEY ? "Đã có" : "CHƯA CÓ!");
            return res.json({ success: true });
        }

        //  Nếu thanh toán thành công (code == "00" hoặc status == "PAID")
        if (body.code == "00" || status === "PAID") {
            console.log(`✅ Đang xử lý đơn hàng: ${orderCode}`);

            //  Cập nhật bảng payments
            await db.query(
                "UPDATE payments SET status = 'success' WHERE order_id = ?",
                [orderCode]
            );

            //  Kích hoạt Premium cho User
            await db.query(
                `UPDATE users 
                 SET is_premium = 1, premium_since = NOW() 
                 WHERE id = (SELECT user_id FROM payments WHERE order_id = ?)`,
                [orderCode]
            );

            console.log(`🎉 User (Đơn ${orderCode}) đã lên Premium thành công!`);
        }

        return res.json({ success: true });

    } catch (error) {
        console.error("❌ Lỗi Webhook:", error);
        res.status(500).json({ success: false });
    }
};