const mongoose = require('mongoose');

const siteSettingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    recipe_banners: [{
        imageUrl: { 
            type: String, 
            required: true 
        },
        targetLink: { 
            type: String, 
            default: ''
        }
    }],
    // Danh sách quyền lợi premium có thực trong hệ thống
    premium_benefits: [{
        id: { type: String, required: true, unique: true }, // benefit identifier
        name: { type: String, required: true }, // Tên hiển thị
        description: { type: String }, // Mô tả chi tiết
        is_active: { type: Boolean, default: true } // Admin có thể bật/tắt tính năng
    }]
}, { timestamps: true });

module.exports = mongoose.model('SiteSetting', siteSettingSchema);
