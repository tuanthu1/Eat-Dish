const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    percent: { type: Number, required: true },
    expiry_date: { type: Date },
    is_active: { type: Boolean, default: true },
    used_count: { type: Number, default: 0 },
    usage_limit: { type: Number, default: null } // null = unlimited
}, { timestamps: true });

module.exports = mongoose.model('DiscountCode', discountSchema);
