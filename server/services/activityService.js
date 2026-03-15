const Activity = require('../models/Activity');

const logActivity = async ({ userId, action, resourceId = null, vaultId = null, details = '' }) => {
  try {
    await Activity.create({ user: userId, action, resourceId, vaultId, details });
  } catch (error) {
    console.error('Failed to log activity:', error.message);
  }
};

module.exports = { logActivity };
