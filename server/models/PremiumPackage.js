const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    duration_days: { type: Number, required: true },
    description: { type: String },
    level: { type: Number, default: 1 },
    // Chứa các ID quyền lợi có thực từ premium_benefits trong SiteSetting
    benefit_ids: [{ type: String }], // Tham chiếu đến benefit.id trong SiteSetting
    is_active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('PremiumPackage', packageSchema);
