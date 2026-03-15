const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Resource = require('../models/Resource');
const Vault = require('../models/Vault');
const Activity = require('../models/Activity');

const router = express.Router();
router.use(authMiddleware);

router.get('/', (req, res) => res.json({ user: req.user }));

router.put('/preferences', async (req, res, next) => {
  try {
    const { defaultVaultView, learningReminder } = req.body;
    const user = req.user;
    if (defaultVaultView && ['grid', 'list'].includes(defaultVaultView)) {
      user.preferences.defaultVaultView = defaultVaultView;
    }
    if (typeof learningReminder === 'boolean') {
      user.preferences.learningReminder = learningReminder;
    }
    await user.save();
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.put('/onboarding', async (req, res, next) => {
  try {
    req.user.onboardingCompleted = req.body.completed ?? true;
    await req.user.save();
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
});

router.delete('/', async (req, res, next) => {
  try {
    const userId = req.user._id;
    await Resource.deleteMany({ owner: userId });
    await Vault.deleteMany({ owner: userId });
    await Activity.deleteMany({ user: userId });
    await Vault.updateMany({ 'sharedWith.user': userId }, { $pull: { sharedWith: { user: userId } } });
    await User.findByIdAndDelete(userId);
    res.clearCookie('token');
    res.json({ message: 'Account deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
