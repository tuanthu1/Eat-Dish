const db = require('../config/db');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const nluModel = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
});
const chatModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

exports.processChat = async (req, res) => {
    try {
        const { message } = req.body;
        
        const userId = req.user?.id; 
        if (!userId) {
            return res.status(401).json({ reply: "Vui lòng đăng nhập để trò chuyện với đầu bếp AI nhé! 👨‍🍳" });
        }
        const [users] = await db.query(
            "SELECT is_premium, IF(last_chat_date = CURDATE(), daily_chat_count, 0) as current_count FROM users WHERE id = ?", 
            [userId]
        );
        
        if (users.length === 0) return res.status(404).json({ reply: "Không tìm thấy thông tin tài khoản." });
        
        const user = users[0];
        let currentCount = user.current_count;
        const CHAT_LIMIT = user.is_premium === 1 ? 50 : 5;

        if (currentCount >= CHAT_LIMIT) {
            return res.status(200).json({ 
                reply: user.is_premium === 1 
                    ? "Bạn đã dùng hết 50 lượt chat VIP hôm nay rồi. Hẹn gặp lại vào ngày mai nhé! 😴" 
                    : "Bạn đã hết 5 lượt chat miễn phí hôm nay. Nâng cấp Premium 👑 để chat thả ga, hoặc quay lại vào ngày mai nhé!"
            });
        }
        const parsePrompt = `
            Bạn là trợ lý phân tích ngôn ngữ tự nhiên cho ứng dụng nấu ăn.
            Phân tích câu nói: "${message}"
            Trả về JSON đúng định dạng sau:
            { "intent": "search" | "random" | "chat", "keywords": [], "max_calo": number | null, "max_time": number | null }
        `;

        const nluResult = await nluModel.generateContent(parsePrompt);
        const parsedData = JSON.parse(nluResult.response.text());

        let finalRecipes = [];
        let isFallbackRandom = false;

        if (parsedData.intent !== 'chat') {
            let sqlBase = "SELECT id, name, calories, time FROM recipes WHERE 1=1";
            let params = [];

            if (parsedData.keywords && parsedData.keywords.length > 0) {
                const likeConditions = parsedData.keywords.map(() => "name LIKE ?").join(" OR ");
                sqlBase += ` AND (${likeConditions})`;
                parsedData.keywords.forEach(w => params.push(`%${w}%`));
            }

            if (parsedData.max_calo) { sqlBase += " AND calories <= ?"; params.push(parsedData.max_calo); }
            if (parsedData.max_time) { sqlBase += " AND time <= ?"; params.push(parsedData.max_time); }

            if (parsedData.intent === 'random') { sqlBase += " ORDER BY RAND() LIMIT 3"; } 
            else { sqlBase += " LIMIT 5"; }

            const [rows] = await db.query(sqlBase, params);
            finalRecipes = rows;

            if (finalRecipes.length === 0 && parsedData.intent === 'search') {
                const [randomRows] = await db.query("SELECT id, name, calories, time FROM recipes ORDER BY RAND() LIMIT 3");
                finalRecipes = randomRows;
                isFallbackRandom = true; 
            }
        }

        const recipeListText = finalRecipes.length > 0 
            ? finalRecipes.map(r => `- [${r.name}](/recipe/${r.id}) (🔥 ${r.calories ? r.calories : 'Chưa rõ'} calo - ⏳ ${r.time ? r.time : 'Chưa rõ'} phút)`).join('\n')
            : "";

        const replyPrompt = `
            Bạn là Bot EatDish vui tính, nhiệt tình. Người dùng nói: "${message}".
            Danh sách món ăn tìm được:
            ${recipeListText ? recipeListText : "Không có món nào khớp."}
            ${isFallbackRandom ? "Lưu ý: Không tìm thấy món user yêu cầu, đây chỉ là món gợi ý bù." : ""}
            
            NHIỆM VỤ QUAN TRỌNG NHẤT:
            - Nếu có món ăn, BẮT BUỘC liệt kê bằng danh sách Markdown (-).
            - BẮT BUỘC chép lại Y HỆT từng dòng trong "Danh sách món ăn tìm được" ở trên.
        `;

        const result = await chatModel.generateContent(replyPrompt);
        
        await db.query(
            "UPDATE users SET daily_chat_count = ?, last_chat_date = CURDATE() WHERE id = ?", 
            [currentCount + 1, userId]
        );

        res.json({ reply: result.response.text() });

    } catch (err) {
        console.error("Chat Error:", err);
        res.status(500).json({ reply: "Xin lỗi, bếp đang bận xíu, bạn gọi lại sau nhé 😅🍳" });
    }
};