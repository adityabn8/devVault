const mongoose = require('mongoose');
const { ACTIVITY_ACTIONS } = require('../config/constants');

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true, enum: ACTIVITY_ACTIONS },
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', default: null },
    vaultId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vault', default: null },
    details: { type: String, default: '' },
  },
  { timestamps: true }
);

activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('Activity', activitySchema);
