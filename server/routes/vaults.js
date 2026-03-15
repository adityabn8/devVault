const express = require('express');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');
const Vault = require('../models/Vault');
const Resource = require('../models/Resource');
const User = require('../models/User');
const { logActivity } = require('../services/activityService');
const { VAULT_COLORS, VAULT_ICONS } = require('../config/constants');

const router = express.Router();
router.use(authMiddleware);

// GET /api/vaults
router.get('/', async (req, res, next) => {
  try {
    const { parent, includeShared = 'true' } = req.query;
    const userId = req.user._id;

    const ownedQuery = {
      owner: userId,
      parentVault: parent ? parent : null,
    };

    const ownedVaults = await Vault.find(ownedQuery).sort({ updatedAt: -1 });

    let sharedVaults = [];
    if (includeShared !== 'false' && !parent) {
      sharedVaults = await Vault.find({
        'sharedWith.user': userId,
        parentVault: null,
      }).populate('owner', 'username avatarUrl displayName');
    }

    // Count sub-vaults
    const allVaultIds = [...ownedVaults, ...sharedVaults].map((v) => v._id);
    const subVaultCounts = await Vault.aggregate([
      { $match: { parentVault: { $in: allVaultIds } } },
      { $group: { _id: '$parentVault', count: { $sum: 1 } } },
    ]);
    const subCountMap = {};
    subVaultCounts.forEach((s) => { subCountMap[s._id.toString()] = s.count; });

    const formatVault = (vault, isOwner) => ({
      _id: vault._id,
      name: vault.name,
      description: vault.description,
      color: vault.color,
      icon: vault.icon,
      parentVault: vault.parentVault,
      isOwner,
      resourceCount: vault.resourceCount,
      completedCount: vault.completedCount,
      subVaultCount: subCountMap[vault._id.toString()] || 0,
      updatedAt: vault.updatedAt,
      sharedWith: vault.sharedWith,
      shareLink: vault.shareLink,
      isPublic: vault.isPublic,
      ...(isOwner ? {} : {
        permission: vault.sharedWith.find((s) => s.user.toString() === userId.toString())?.permission,
        sharedBy: vault.owner,
      }),
    });

    const vaults = [
      ...ownedVaults.map((v) => formatVault(v, true)),
      ...sharedVaults.map((v) => formatVault(v, false)),
    ];

    res.json({ vaults });
  } catch (error) {
    next(error);
  }
});

// GET /api/vaults/:id
router.get('/:id', async (req, res, next) => {
  try {
    const vault = await Vault.findById(req.params.id)
      .populate('owner', 'username avatarUrl displayName')
      .populate('sharedWith.user', 'username avatarUrl displayName');

    if (!vault) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Vault not found' } });
    }

    const isOwner = vault.owner._id.toString() === req.user._id.toString();
    const sharedEntry = vault.sharedWith.find((s) => s.user._id.toString() === req.user._id.toString());

    if (!isOwner && !sharedEntry) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    const subVaultCount = await Vault.countDocuments({ parentVault: vault._id });

    res.json({
      vault: {
        ...vault.toObject(),
        isOwner,
        permission: isOwner ? 'edit' : sharedEntry.permission,
        subVaultCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/vaults
router.post('/', async (req, res, next) => {
  try {
    const { name, description, color, icon, parentVault } = req.body;
    const userId = req.user._id;

    if (!name?.trim()) {
      return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Name is required' } });
    }
    if (name.trim().length > 50) {
      return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Name must be 50 characters or less' } });
    }
    if (color && !VAULT_COLORS.includes(color)) {
      return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid color' } });
    }
    if (icon && !VAULT_ICONS.includes(icon)) {
      return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid icon' } });
    }

    // Validate parent vault
    if (parentVault) {
      const parent = await Vault.findOne({ _id: parentVault, owner: userId });
      if (!parent) {
        return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Parent vault not found' } });
      }
      if (parent.parentVault) {
        return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Max vault depth is 2 levels' } });
      }
    }

    // Check max top-level vaults
    if (!parentVault) {
      const count = await Vault.countDocuments({ owner: userId, parentVault: null });
      if (count >= 20) {
        return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Maximum 20 top-level vaults allowed' } });
      }
    }

    // Duplicate name check
    const existing = await Vault.findOne({
      owner: userId,
      name: name.trim(),
      parentVault: parentVault || null,
    });
    if (existing) {
      return res.status(409).json({ error: { code: 'DUPLICATE', message: 'A vault with this name already exists' } });
    }

    const vault = await Vault.create({
      name: name.trim(),
      description: description?.trim() || '',
      owner: userId,
      color: color || '#2563EB',
      icon: icon || 'folder',
      parentVault: parentVault || null,
    });

    await logActivity({
      userId,
      action: 'vault_created',
      vaultId: vault._id,
      details: `Created vault "${vault.name}"`,
    });

    res.status(201).json({ vault });
  } catch (error) {
    next(error);
  }
});

// PUT /api/vaults/:id
router.put('/:id', async (req, res, next) => {
  try {
    const vault = await Vault.findOne({ _id: req.params.id, owner: req.user._id });
    if (!vault) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Vault not found' } });
    }

    const { name, description, color, icon } = req.body;

    if (name !== undefined) {
      if (!name.trim()) return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Name is required' } });
      if (name.trim().length > 50) return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Name too long' } });

      const existing = await Vault.findOne({
        owner: req.user._id,
        name: name.trim(),
        parentVault: vault.parentVault,
        _id: { $ne: vault._id },
      });
      if (existing) {
        return res.status(409).json({ error: { code: 'DUPLICATE', message: 'A vault with this name already exists' } });
      }
      vault.name = name.trim();
    }
    if (description !== undefined) vault.description = description.trim();
    if (color && VAULT_COLORS.includes(color)) vault.color = color;
    if (icon && VAULT_ICONS.includes(icon)) vault.icon = icon;

    await vault.save();
    res.json({ vault });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/vaults/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const vault = await Vault.findOne({ _id: req.params.id, owner: req.user._id });
    if (!vault) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Vault not found' } });
    }

    const resourceCount = await Resource.countDocuments({ vault: vault._id });
    if (resourceCount > 0) {
      return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Cannot delete vault with resources. Move or delete resources first.' } });
    }

    const subVaultCount = await Vault.countDocuments({ parentVault: vault._id });
    if (subVaultCount > 0) {
      return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Cannot delete vault with sub-vaults. Delete sub-vaults first.' } });
    }

    await vault.deleteOne();
    res.json({ message: 'Vault deleted' });
  } catch (error) {
    next(error);
  }
});

// POST /api/vaults/:id/share-link
router.post('/:id/share-link', async (req, res, next) => {
  try {
    const vault = await Vault.findOne({ _id: req.params.id, owner: req.user._id });
    if (!vault) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Vault not found' } });
    }
    vault.shareLink = uuidv4();
    vault.isPublic = true;
    await vault.save();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.json({ shareLink: `${clientUrl}/shared/${vault.shareLink}` });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/vaults/:id/share-link
router.delete('/:id/share-link', async (req, res, next) => {
  try {
    const vault = await Vault.findOne({ _id: req.params.id, owner: req.user._id });
    if (!vault) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Vault not found' } });
    }
    vault.shareLink = null;
    vault.isPublic = false;
    await vault.save();
    res.json({ message: 'Share link deactivated' });
  } catch (error) {
    next(error);
  }
});

// POST /api/vaults/:id/share (share with user)
router.post('/:id/share', async (req, res, next) => {
  try {
    const vault = await Vault.findOne({ _id: req.params.id, owner: req.user._id });
    if (!vault) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Vault not found' } });
    }

    if (vault.parentVault) {
      return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Cannot share sub-vaults directly' } });
    }

    const { username, permission } = req.body;
    if (!username || !['view', 'edit'].includes(permission)) {
      return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'username and permission (view/edit) required' } });
    }

    const targetUser = await User.findOne({ username });
    if (!targetUser) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Cannot share with yourself' } });
    }

    if (vault.sharedWith.length >= 10) {
      return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Maximum 10 collaborators per vault' } });
    }

    const existing = vault.sharedWith.find((s) => s.user.toString() === targetUser._id.toString());
    if (existing) {
      existing.permission = permission;
    } else {
      vault.sharedWith.push({ user: targetUser._id, permission });
    }

    await vault.save();
    await logActivity({ userId: req.user._id, action: 'vault_shared', vaultId: vault._id, details: `Shared vault "${vault.name}" with @${username}` });

    const populated = await Vault.findById(vault._id).populate('sharedWith.user', 'username avatarUrl displayName');
    res.json({ vault: populated });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/vaults/:id/share/:userId
router.delete('/:id/share/:userId', async (req, res, next) => {
  try {
    const vault = await Vault.findOne({ _id: req.params.id, owner: req.user._id });
    if (!vault) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Vault not found' } });
    vault.sharedWith = vault.sharedWith.filter((s) => s.user.toString() !== req.params.userId);
    await vault.save();
    res.json({ message: 'Collaborator removed' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
