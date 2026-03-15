const express = require('express');
const authMiddleware = require('../middleware/auth');
const Resource = require('../models/Resource');
const Vault = require('../models/Vault');

const router = express.Router();
router.use(authMiddleware);

// GET /api/search
router.get('/', async (req, res, next) => {
  try {
    const { q, type, vault: vaultId, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Query must be at least 2 characters' } });
    }

    const userId = req.user._id;
    const limitNum = Math.min(50, parseInt(limit));

    // Get all accessible vault IDs
    const ownedVaults = await Vault.find({ owner: userId }).select('_id');
    const sharedVaults = await Vault.find({ 'sharedWith.user': userId }).select('_id');
    const accessibleVaultIds = [
      ...ownedVaults.map((v) => v._id),
      ...sharedVaults.map((v) => v._id),
    ];

    const query = {
      $text: { $search: q.trim() },
      $or: [
        { owner: userId },
        { vault: { $in: accessibleVaultIds } },
      ],
    };

    if (type) query.type = type;
    if (vaultId) query.vault = vaultId;

    const results = await Resource.find(query, { score: { $meta: 'textScore' } })
      .populate('vault', 'name color')
      .sort({ score: { $meta: 'textScore' } })
      .limit(limitNum)
      .lean();

    res.json({
      results: results.map((r) => ({
        _id: r._id,
        title: r.title,
        type: r.type,
        vault: r.vault,
        tags: r.tags,
        status: r.status,
        createdAt: r.createdAt,
      })),
      total: results.length,
      query: q.trim(),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/search/tags
router.get('/tags', async (req, res, next) => {
  try {
    const { q } = req.query;
    const match = { owner: req.user._id };
    if (q) match.tags = { $regex: `^${q}`, $options: 'i' };

    const result = await Resource.aggregate([
      { $match: match },
      { $unwind: '$tags' },
      ...(q ? [{ $match: { tags: { $regex: `^${q}`, $options: 'i' } } }] : []),
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 30 },
      { $project: { name: '$_id', count: 1, _id: 0 } },
    ]);

    res.json({ tags: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
