const db = require('../config/db');
const jwt = require('jsonwebtoken');

// Lấy danh sách món ăn 
exports.getAllRecipes = async (req, res) => {
    try {
        const currentUserId = req.query.userId || (req.user ? req.user.id : null);
        let sql = `
            SELECT 
                r.*, 
                r.author_id,  
                u.id AS user_id, 
                u.fullname, 
                u.avatar 
            FROM recipes r 
            JOIN users u ON r.author_id = u.id 
            WHERE 1=1
        `;
        let queryParams = [];
        if (currentUserId) {
            sql += ` AND r.author_id NOT IN (
                SELECT blocked_id FROM user_blocks WHERE blocker_id = ?
                UNION 
                SELECT blocker_id FROM user_blocks WHERE blocked_id = ?
            )`;
            queryParams.push(currentUserId, currentUserId);
        }
        sql += ` ORDER BY r.created_at DESC`;
        const [rows] = await db.query(sql, queryParams);
        let isUserPremium = false;
        const authHeader = req.headers['authorization'];
        
        if (authHeader) {
            const token = authHeader.split(' ')[1]; 
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'eatdish_secret_key');
                const [users] = await db.query("SELECT is_premium FROM users WHERE id = ?", [decoded.id]);
                if (users.length > 0 && users[0].is_premium === 1) {
                    isUserPremium = true;
                }
            } catch (e) {
                console.log("Lỗi xác thực Token:", e.message);
            }
        }
        const finalRecipes = rows.map(row => {
            let ingredients = typeof row.ingredients === 'string' ? JSON.parse(row.ingredients || '[]') : row.ingredients;
            let steps = typeof row.steps === 'string' ? JSON.parse(row.steps || '[]') : row.steps;
            
            if ((row.is_premium === 1 || row.is_vip === 1) && !isUserPremium) {
                ingredients = ["🔒 Nội dung dành riêng cho thành viên VIP"];
                steps = ["🔒 Vui lòng nâng cấp tài khoản để xem chi tiết."];
                row.video_url = null;
                row.youtube_link = null;
            }

            return {
                ...row,
                ingredients: ingredients,
                steps: steps
            };
        });
        res.json(finalRecipes);
        
    } catch (err) {
        console.error("Lỗi getAllRecipes:", err);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// Thêm món ăn mới
exports.createRecipe = async (req, res) => {
    try {
        const { name, userId, description, calories, time, ingredients, steps, video_url } = req.body;
        
        const imgUrl = req.file ? `/uploads/${req.file.filename}` : null;

        if (!name || !userId || !imgUrl) {
            return res.status(400).json({ message: "Vui lòng điền tên, chọn ảnh và kiểm tra đăng nhập." });
        }

        const sql = `
            INSERT INTO recipes 
            (name, author_id, description, calories, time, img, ingredients, steps, video_url, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending' , NOW())
        `;

        await db.query(sql, [
            name, 
            userId, 
            description || '', 
            calories, 
            time, 
            imgUrl, 
            ingredients, 
            steps,
            video_url || ''
        ]);

        res.json({ success: true, message: "Đã gửi công thức chờ duyệt!" });
    } catch (err) {
        console.error("Lỗi upload recipe:", err);
        res.status(500).json({ error: err.message });
    }
};


// Toggle Yêu thích món ăn 
exports.toggleFavorite = async (req, res) => {
    try {
        const { userId, recipeId } = req.body;
        
        const [exists] = await db.query("SELECT * FROM favorites WHERE user_id = ? AND recipe_id = ?", [userId, recipeId]);

        if (exists.length > 0) {
            await db.query("DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?", [userId, recipeId]);
            return res.json({ status: 'unliked' });

        } else {
            await db.query("INSERT INTO favorites (user_id, recipe_id) VALUES (?, ?)", [userId, recipeId]);
            const [recipes] = await db.query("SELECT author_id, name FROM recipes WHERE id = ?", [recipeId]);
            
            if (recipes.length > 0) {
                const authorId = recipes[0].author_id;
                const recipeName = recipes[0].name;

                if (parseInt(authorId) !== parseInt(userId)) {
                    
                    const [liker] = await db.query("SELECT fullname FROM users WHERE id = ?", [userId]);
                    const likerName = liker.length > 0 ? liker[0].fullname : "Ai đó";

                    const msg = `${likerName} đã thích món ăn "${recipeName}" của bạn. ❤️`;

                    await db.query(
                        "INSERT INTO notifications (user_id, message, type, is_read) VALUES (?, ?, 'like_recipe', 0)",
                        [authorId, msg]
                    );
                }
            }

            return res.json({ status: 'liked' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

//  Lấy danh sách yêu thích của User
exports.getUserFavorites = async (req, res) => {
    const { userId } = req.params;
    try {
        const sql = `
            SELECT r.* FROM recipes r 
            JOIN favorites f ON r.id = f.recipe_id 
            WHERE f.user_id = ?
        `;
        const [rows] = await db.query(sql, [userId]);
        
        const favorites = rows.map(row => ({
            ...row,
            ingredients: typeof row.ingredients === 'string' ? JSON.parse(row.ingredients) : row.ingredients
        }));

        res.json(favorites);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
//lấy món ăn
exports.getRecipeById = async (req, res) => {
    try {
        const { id } = req.params;

        const sql = `
            SELECT r.*, u.fullname as author_name, u.avatar as author_avatar
            FROM recipes r
            LEFT JOIN users u ON r.author_id = u.id
            WHERE r.id = ?
        `;
        const [recipes] = await db.query(sql, [id]);

        if (recipes.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy món ăn" });
        }

        let recipe = { ...recipes[0] };

        let isUserPremium = false;
        const authHeader = req.headers['authorization'];
        
        if (authHeader) {
            const token = authHeader.split(' ')[1]; 
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'eatdish_secret_key');
                
                const [users] = await db.query("SELECT is_premium FROM users WHERE id = ?", [decoded.id]);
                
                if (users.length > 0 && users[0].is_premium === 1) {
                    isUserPremium = true;
                }
            } catch (e) {
                console.log("Token lỗi hoặc hết hạn:", e.message);
            }
        }

        if ((recipe.is_premium === 1 || recipe.is_vip === 1) && !isUserPremium) {
            
            recipe.ingredients = JSON.stringify(["🔒 Nội dung dành riêng cho thành viên VIP"]);
            recipe.steps = JSON.stringify(["🔒 Vui lòng nâng cấp tài khoản để xem chi tiết."]);
            
            recipe.video_url = null;
            recipe.youtube_link = null;
        }

        res.json(recipe);
        
    } catch (err) {
        console.error("Lỗi getRecipeById:", err);
        res.status(500).json({ message: "Lỗi Server" });
    }
};
// Tìm kiếm và Bộ lọc công thức
exports.searchRecipes = async (req, res) => {
    try {
        const { q, maxCal, maxTime } = req.query;

        let sql = `
            SELECT r.*, u.fullname, u.avatar 
            FROM recipes r 
            JOIN users u ON r.author_id = u.id 
        `;
        let params = [];

        if (q) {
            sql += " AND r.name LIKE ?";
            params.push(`%${q}%`);
        }

        if (maxCal) {
            sql += " AND r.calories <= ?";
            params.push(parseInt(maxCal));
        }

        if (maxTime) {
            sql += " AND r.time <= ?";
            params.push(parseInt(maxTime));
        }
        sql += " ORDER BY r.created_at DESC";

        const [rows] = await db.query(sql, params);

        const recipes = rows.map(row => ({
            ...row,
            ingredients: typeof row.ingredients === 'string' ? JSON.parse(row.ingredients || '[]') : row.ingredients,
            steps: typeof row.steps === 'string' ? JSON.parse(row.steps || '[]') : row.steps
        }));

        res.json(recipes);
    } catch (err) {
        console.error("Lỗi search API:", err);
        res.status(500).json({ message: "Lỗi máy chủ khi tìm kiếm công thức" });
    }
};
//lấy món ăn nhiều tym
exports.getTrendingRecipes = async (req, res) => {
    try {
        const currentUserId = req.query.userId; 
        
        let sql = `
            SELECT 
                r.*, 
                (SELECT COUNT(*) FROM favorites f WHERE f.recipe_id = r.id) as total_likes
            FROM recipes r
            WHERE 1=1
        `;
        let params = [];
        if (currentUserId) {
            sql += ` AND r.author_id NOT IN (
                SELECT blocked_id FROM user_blocks WHERE blocker_id = ?
                UNION 
                SELECT blocker_id FROM user_blocks WHERE blocked_id = ?
            )`;
            params.push(currentUserId, currentUserId);
        }

        sql += ` ORDER BY total_likes DESC LIMIT 3`;
        
        const [rows] = await db.query(sql, params);

        const parseSafe = (data) => {
            try { return typeof data === 'string' ? JSON.parse(data) : (data || []); } 
            catch (e) { return []; }
        };

        const trendingData = rows.map(row => ({
            ...row,
            img: row.img || row.image_url || 'https://via.placeholder.com/150', 
            ingredients: parseSafe(row.ingredients),
            steps: parseSafe(row.steps)
        }));

        res.json(trendingData);
    } catch (err) {
        console.error("Lỗi getTrendingRecipes:", err);
        res.status(500).json({ message: "Lỗi Server", error: err.message });
    }
};
//  Gửi đánh giá mới
exports.addReview = async (req, res) => {
    try {
        const { recipeId, userId, rating, comment } = req.body;
        const sql = "INSERT INTO recipe_reviews (recipe_id, user_id, rating, comment) VALUES (?, ?, ?, ?)";
        await db.query(sql, [recipeId, userId, rating, comment]);
        res.status(200).json({ message: "Đã đăng đánh giá!" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

// Lấy danh sách đánh giá của một món ăn
exports.getRecipeReviews = async (req, res) => {
    try {
        const { recipeId } = req.params;
        const sql = `
            SELECT r.*, u.username, u.avatar 
            FROM recipe_reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.recipe_id = ?
            ORDER BY r.created_at DESC
        `;
        const [reviews] = await db.query(sql, [recipeId]);
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
};
//lưu lịch sử nấu
exports.markAsCooked = async (req, res) => {
    try {
        const { userId, recipeId } = req.body;

        const [existing] = await db.query(
            "SELECT * FROM cooked_history WHERE user_id = ? AND recipe_id = ?",
            [userId, recipeId]
        );

        if (existing.length > 0) {
            return res.status(200).json({ 
                message: "Món ăn này đã có trong lịch sử nấu nướng của bạn!" 
            });
        }

        const sql = "INSERT INTO cooked_history (user_id, recipe_id) VALUES (?, ?)";
        await db.query(sql, [userId, recipeId]);
        
        res.status(200).json({ message: "Đã ghi nhận vào lịch sử nấu nướng!" });
    } catch (err) {
        console.error("Lỗi markAsCooked:", err);
        res.status(500).json({ message: "Lỗi server khi lưu lịch sử" });
    }
};
//lấy lịch sử nấu
exports.getCookedHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const sql = `
            SELECT 
                r.*, 
                h.cooked_at,
                u.fullname AS author_name, 
                u.username,
                u.avatar AS author_avatar
            FROM cooked_history h
            JOIN recipes r ON h.recipe_id = r.id
            JOIN users u ON r.author_id = u.id 
            WHERE h.user_id = ?
            ORDER BY h.cooked_at DESC
        `;
        const [history] = await db.query(sql, [userId]);
        res.json(history);
    } catch (err) {
        console.log("Lỗi tải lịch sử:", err); 
        res.status(500).json({ message: "Lỗi tải lịch sử" });
    }
};
// Lọc công thức theo calo, thời gian, nguyên liệu
exports.filterRecipes = async (req, res) => {
    try {
        const { maxCal, maxTime, ing } = req.query;
        let sql = "SELECT * FROM recipes WHERE status = 'active'";
        let params = [];

        if (maxCal) {
            sql += " AND calories <= ?";
            params.push(maxCal);
        }
        if (maxTime) {
            sql += " AND time <= ?";
            params.push(maxTime);
        }
        if (ing) {
            sql += " AND ingredients LIKE ?";
            params.push(`%${ing}%`); 
        }

        sql += " ORDER BY created_at DESC";
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server" });
    }
};
// Toggle món VIP
exports.toggleVip = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [recipes] = await db.query("SELECT id, is_premium FROM recipes WHERE id = ?", [id]);
        if (recipes.length === 0) return res.status(404).json({ message: "Không tìm thấy món ăn" });

        const currentStatus = recipes[0].is_premium;
        
        const newStatus = currentStatus === 1 ? 0 : 1;

        await db.query("UPDATE recipes SET is_premium = ? WHERE id = ?", [newStatus, id]);

        res.json({ 
            status: 'success', 
            message: newStatus === 1 ? "Đã chuyển thành món VIP 👑" : "Đã chuyển thành món thường",
            is_premium: newStatus
        });

    } catch (err) {
        console.error("Lỗi Toggle VIP:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
};
// Hàm cho User xóa bài của chính mình
exports.deleteMyRecipe = async (req, res) => {
    try {
        const recipeId = req.params.id;
        const userId = req.user.id; 

        const sql = "DELETE FROM recipes WHERE id = ? AND author_id = ?";
        const [result] = await db.query(sql, [recipeId, userId]);

        if (result.affectedRows === 0) {
            return res.status(403).json({ message: "Bạn không có quyền xóa bài viết này hoặc bài viết không tồn tại!" });
        }

        res.json({ message: "Đã xóa bài viết thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi Server" });
    }
};