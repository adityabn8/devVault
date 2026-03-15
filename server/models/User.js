const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    githubId: { type: Number, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    email: { type: String, default: null },
    avatarUrl: { type: String, required: true },
    bio: { type: String, default: '' },
    profileUrl: { type: String, required: true },
    accessToken: { type: String, required: true },
    preferences: {
      defaultVaultView: { type: String, enum: ['grid', 'list'], default: 'grid' },
      learningReminder: { type: Boolean, default: false },
    },
    onboardingCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
