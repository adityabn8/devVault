const mongoose = require('mongoose');
const { RESOURCE_TYPES } = require('../config/constants');

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    type: { type: String, required: true, enum: RESOURCE_TYPES },
    url: { type: String, default: null },
    metadata: {
      description: { type: String, default: '' },
      siteName: { type: String, default: '' },
      favicon: { type: String, default: '' },
      thumbnail: { type: String, default: '' },
    },
    snippet: {
      code: { type: String, default: null },
      lang: { type: String, default: '' },
    },
    vault: { type: mongoose.Schema.Types.ObjectId, ref: 'Vault', required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    status: { type: String, enum: ['to_read', 'in_progress', 'completed'], default: 'to_read' },
    notes: { type: String, default: '' },
    keyTakeaways: [{ type: String, trim: true }],
    lastOpenedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

resourceSchema.index(
  { title: 'text', notes: 'text', 'snippet.code': 'text', tags: 'text', keyTakeaways: 'text' },
  { weights: { title: 10, tags: 5 } }
);
resourceSchema.index({ owner: 1, vault: 1 });
resourceSchema.index({ owner: 1, status: 1 });
resourceSchema.index({ owner: 1, tags: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
