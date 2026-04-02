const express = require('express');
const authMiddleware = require('../middleware/auth');
const Resource = require('../models/Resource');
const Vault = require('../models/Vault');
const { logActivity } = require('../services/activityService');
const { extractMetadata } = require('../services/metadataService');
const { metadataLimiter } = require('../middleware/rateLimit');

const router = express.Router();
router.use(authMiddleware);

// Helper: check vault access
const checkVaultAccess = async (vaultId, userId, requireEdit = false) => {
  const vault = await Vault.findById(vaultId);
  if (!vault) return null;
  const isOwner = vault.owner.toString() === userId.toString();
  if (isOwner) return { vault, permission: 'edit' };
  const sharedEntry = vault.sharedWith.find((s) => s.user.toString() === userId.toString());
  if (!sharedEntry) return null;
  if (requireEdit && sharedEntry.permission !== 'edit') return null;
  return { vault, permission: sharedEntry.permission };
};

// POST /api/resources/extract-metadata
router.post('/extract-metadata', metadataLimiter, async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'URL is required' } });
    const metadata = await extractMetadata(url);
    res.json(metadata);
  } catch (error) {
    next(error);
  }
});

// GET /api/resources
router.get('/', async (req, res, next) => {
  try {
    const { vault: vaultId, status, type, tag, sort = 'newest', page = 1, limit = 20 } = req.query;
    if (!vaultId) return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'vault query param required' } });

    const access = await checkVaultAccess(vaultId, req.user._id);
    if (!access) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });

    const query = { vault: vaultId };
    if (status) query.status = status;
    if (type) query.type = type;
    if (tag) query.tags = tag;

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      last_opened: { lastOpenedAt: -1 },
      title_asc: { title: 1 },
      title_desc: { title: -1 },
    };
    const sortOption = sortMap[sort] || sortMap.newest;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [resources, total] = await Promise.all([
      Resource.find(query).sort(sortOption).skip(skip).limit(limitNum).lean(),
      Resource.countDocuments(query),
    ]);

    res.json({
      resources,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/resources
router.post('/', async (req, res, next) => {
  try {
    const { url, vault: vaultId, title, type, tags, status, notes, snippet } = req.body;

    if (!vaultId) return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'vault is required' } });

    const access = await checkVaultAccess(vaultId, req.user._id, true);
    if (!access) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });

    let resourceData = {
      vault: vaultId,
      owner: req.user._id,
      tags: Array.isArray(tags) ? tags.slice(0, 10).map((t) => t.trim().toLowerCase().slice(0, 30)) : [],
      status: status || 'to_read',
      notes: notes || '',
    };

    if (type === 'snippet') {
      if (!title?.trim()) return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'title is required for snippets' } });
      if (!snippet?.code?.trim()) return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'snippet.code is required' } });
      if (!snippet?.lang) return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'snippet.lang is required' } });
      resourceData = { ...resourceData, title: title.trim(), type: 'snippet', snippet };
    } else {
      if (!url?.trim()) return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'url is required' } });
      try { new URL(url); } catch { return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid URL' } }); }

      // Duplicate URL check
      const existing = await Resource.findOne({ vault: vaultId, url: url.trim() });
      if (existing) return res.status(409).json({ error: { code: 'DUPLICATE', message: 'This URL is already saved in this vault' } });

      const meta = await extractMetadata(url.trim());
      resourceData = {
        ...resourceData,
        url: url.trim(),
        title: (title?.trim()) || meta.title,
        type: type || meta.suggestedType,
        metadata: {
          description: meta.description,
          siteName: meta.siteName,
          favicon: meta.favicon,
          thumbnail: meta.thumbnail,
        },
      };
    }

    if (resourceData.status === 'completed') {
      resourceData.completedAt = new Date();
    }

    const resource = await Resource.create(resourceData);

    // Update vault counts
    await Vault.findByIdAndUpdate(vaultId, {
      $inc: {
        resourceCount: 1,
        ...(resource.status === 'completed' ? { completedCount: 1 } : {}),
      },
    });

    await logActivity({
      userId: req.user._id,
      action: type === 'snippet' ? 'snippet_added' : 'resource_saved',
      resourceId: resource._id,
      vaultId,
      details: `Saved "${resource.title}" to vault`,
    });

    res.status(201).json({ resource });
  } catch (error) {
    next(error);
  }
});

// GET /api/resources/:id
router.get('/:id', async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Resource not found' } });

    const access = await checkVaultAccess(resource.vault, req.user._id);
    if (!access) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });

    resource.lastOpenedAt = new Date();
    await resource.save();

    const vault = await Vault.findById(resource.vault).select('name color icon');
    res.json({ resource, vault });
  } catch (error) {
    next(error);
  }
});

// PUT /api/resources/:id
router.put('/:id', async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Resource not found' } });

    const access = await checkVaultAccess(resource.vault, req.user._id, true);
    if (!access) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });

    const { title, type, tags, status, notes, keyTakeaways, snippet, url } = req.body;
    const previousStatus = resource.status;

    if (title !== undefined) resource.title = title;
    if (type !== undefined) resource.type = type;
    if (url !== undefined) resource.url = url;
    if (tags !== undefined) resource.tags = tags.slice(0, 10).map((t) => t.trim().toLowerCase().slice(0, 30));
    if (keyTakeaways !== undefined) resource.keyTakeaways = keyTakeaways.slice(0, 10);
    if (snippet !== undefined) resource.snippet = snippet;

    let activities = [];
    if (notes !== undefined && notes !== resource.notes) {
      resource.notes = notes;
      activities.push({ action: 'notes_updated', details: `Updated notes for "${resource.title}"` });
    }

    if (status !== undefined && status !== previousStatus) {
      resource.status = status;
      activities.push({ action: 'status_changed', details: `Changed status of "${resource.title}" to ${status}` });

      const vaultUpdate = {};
      if (status === 'completed') {
        resource.completedAt = new Date();
        vaultUpdate.$inc = { completedCount: 1 };
      } else if (previousStatus === 'completed') {
        resource.completedAt = null;
        vaultUpdate.$inc = { completedCount: -1 };
      }
      if (Object.keys(vaultUpdate).length) {
        await Vault.findByIdAndUpdate(resource.vault, vaultUpdate);
      }
    }

    await resource.save();

    for (const act of activities) {
      await logActivity({ userId: req.user._id, ...act, resourceId: resource._id, vaultId: resource.vault });
    }

    const vault = await Vault.findById(resource.vault).select('name color icon');
    res.json({ resource, vault });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/resources/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Resource not found' } });

    const access = await checkVaultAccess(resource.vault, req.user._id, true);
    if (!access) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });

    const vaultUpdate = { $inc: { resourceCount: -1 } };
    if (resource.status === 'completed') {
      vaultUpdate.$inc.completedCount = -1;
    }

    await resource.deleteOne();
    await Vault.findByIdAndUpdate(resource.vault, vaultUpdate);
    await logActivity({ userId: req.user._id, action: 'resource_deleted', vaultId: resource.vault, details: `Deleted "${resource.title}"` });

    res.json({ message: 'Resource deleted' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/resources/:id/move
router.put('/:id/move', async (req, res, next) => {
  try {
    const resource = await Resource.findOne({ _id: req.params.id, owner: req.user._id });
    if (!resource) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Resource not found' } });

    const { vault: targetVaultId } = req.body;
    const targetAccess = await checkVaultAccess(targetVaultId, req.user._id, true);
    if (!targetAccess) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied to target vault' } });

    const oldVaultId = resource.vault;
    const wasCompleted = resource.status === 'completed';

    // Update old vault counts
    await Vault.findByIdAndUpdate(oldVaultId, {
      $inc: { resourceCount: -1, ...(wasCompleted ? { completedCount: -1 } : {}) },
    });

    resource.vault = targetVaultId;
    await resource.save();

    // Update new vault counts
    await Vault.findByIdAndUpdate(targetVaultId, {
      $inc: { resourceCount: 1, ...(wasCompleted ? { completedCount: 1 } : {}) },
    });

    res.json({ resource });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
