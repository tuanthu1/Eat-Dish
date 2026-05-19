const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PendingAdminActionSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'User' },
  username: { type: String },
  action: { type: String, required: true },
  params: { type: Schema.Types.Mixed },
  token: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
});

module.exports = mongoose.model('PendingAdminAction', PendingAdminActionSchema);
