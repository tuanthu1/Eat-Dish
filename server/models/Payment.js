const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    order_id: { type: String, unique: true, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'PremiumPackage' },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    coupon_code: { type: String }
    , coupon_reserved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);