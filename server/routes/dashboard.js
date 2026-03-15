const express = require('express');
const authMiddleware = require('../middleware/auth');
const Resource = require('../models/Resource');
const Vault = require('../models/Vault');
const Activity = require('../models/Activity');

const router = express.Router();
router.use(authMiddleware);

// GET /api/dashboard/stats
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    const [
      totalResources,
      completedResources,
      totalSnippets,
      totalVaults,
      resourcesThisWeek,
      completedThisWeek,
    ] = await Promise.all([
      Resource.countDocuments({ owner: userId }),
      Resource.countDocuments({ owner: userId, status: 'completed' }),
      Resource.countDocuments({ owner: userId, type: 'snippet' }),
      Vault.countDocuments({ owner: userId }),
      Resource.countDocuments({ owner: userId, createdAt: { $gte: weekStart } }),
      Resource.countDocuments({ owner: userId, status: 'completed', completedAt: { $gte: weekStart } }),
    ]);

    // Count notes words this week
    const recentNoteActivities = await Activity.countDocuments({
      user: userId,
      action: 'notes_updated',
      createdAt: { $gte: weekStart },
    });

    // Streak calculation
    const activities = await Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .select('createdAt')
      .lean();

    const activeDays = new Set(
      activities.map((a) => new Date(a.createdAt).toISOString().slice(0, 10))
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let checkDate = activeDays.has(today) ? new Date() : new Date(Date.now() - 86400000);

    while (true) {
      const dateStr = checkDate.toISOString().slice(0, 10);
      if (activeDays.has(dateStr)) {
        currentStreak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else {
        break;
      }
    }

    // Longest streak
    const sortedDays = Array.from(activeDays).sort();
    for (let i = 0; i < sortedDays.length; i++) {
      if (i === 0) { tempStreak = 1; }
      else {
        const prev = new Date(sortedDays[i - 1]);
        const curr = new Date(sortedDays[i]);
        const diff = (curr - prev) / 86400000;
        tempStreak = diff === 1 ? tempStreak + 1 : 1;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    res.json({
      stats: {
        totalResources,
        completedResources,
        totalSnippets,
        totalVaults,
        resourcesThisWeek,
        completedThisWeek,
        notesWordsThisWeek: recentNoteActivities * 50, // rough estimate
        currentStreak,
        longestStreak,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/heatmap
router.get('/heatmap', async (req, res, next) => {
  try {
    const { days = 90 } = req.query;
    const daysNum = Math.min(365, Math.max(1, parseInt(days)));
    const since = new Date(Date.now() - daysNum * 86400000);

    const activities = await Activity.find({ user: req.user._id, createdAt: { $gte: since } })
      .select('createdAt')
      .lean();

    const countMap = {};
    activities.forEach((a) => {
      const date = new Date(a.createdAt).toISOString().slice(0, 10);
      countMap[date] = (countMap[date] || 0) + 1;
    });

    const heatmap = [];
    for (let i = daysNum - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      heatmap.push({ date, count: countMap[date] || 0 });
    }

    res.json({ heatmap });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/activity
router.get('/activity', async (req, res, next) => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || 20)));
    const activities = await Activity.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json({ activities });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/continue
router.get('/continue', async (req, res, next) => {
  try {
    const resources = await Resource.find({ owner: req.user._id, status: 'in_progress' })
      .sort({ lastOpenedAt: -1 })
      .limit(5)
      .lean();
    const populatedResources = await Promise.all(
      resources.map(async (r) => {
        const vault = await Vault.findById(r.vault).select('name color').lean();
        return { ...r, vaultData: vault };
      })
    );
    res.json({ resources: populatedResources });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
