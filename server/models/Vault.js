const mongoose = require('mongoose');
const { VAULT_COLORS, VAULT_ICONS } = require('../config/constants');

const vaultSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    description: { type: String, default: '', maxlength: 200 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    color: { type: String, default: '#2563EB', enum: VAULT_COLORS },
    icon: { type: String, default: 'folder', enum: VAULT_ICONS },
    parentVault: { type: mongoose.Schema.Types.ObjectId, ref: 'Vault', default: null },
    sharedWith: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        permission: { type: String, enum: ['view', 'edit'], default: 'view' },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    shareLink: { type: String, default: null },
    isPublic: { type: Boolean, default: false },
    resourceCount: { type: Number, default: 0 },
    completedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

vaultSchema.index({ owner: 1, parentVault: 1 });

module.exports = mongoose.model('Vault', vaultSchema);
