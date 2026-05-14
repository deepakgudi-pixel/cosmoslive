const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

/**
 * POST /api/users/sync
 * Called by Clerk webhook to create/update user in DB
 */
router.post('/sync', express.json(), async (req, res, next) => {
  try {
    const { clerk_id, email } = req.body;
    if (!clerk_id || !email) {
      return res.status(400).json({ error: 'clerk_id and email required' });
    }

    const user = await prisma.user.upsert({
      where: { clerkId: clerk_id },
      update: { email },
      create: { clerkId: clerk_id, email },
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/users/:clerkId/bookmarks
 * Returns all bookmarks for a user
 */
router.get('/:clerkId/bookmarks', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.params.clerkId },
      include: { bookmarks: { orderBy: { savedAt: 'desc' } } },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ bookmarks: user.bookmarks });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/users/:clerkId/bookmarks
 * Add a bookmark
 */
router.post('/:clerkId/bookmarks', async (req, res, next) => {
  try {
    const { type, referenceId, metadata } = req.body;
    const user = await prisma.user.findUnique({
      where: { clerkId: req.params.clerkId },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const bookmark = await prisma.bookmark.create({
      data: {
        userId: user.id,
        type,
        referenceId,
        metadata: metadata || {},
      },
    });

    res.status(201).json({ bookmark });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/users/:clerkId/bookmarks/:bookmarkId
 * Remove a bookmark
 */
router.delete('/:clerkId/bookmarks/:bookmarkId', async (req, res, next) => {
  try {
    await prisma.bookmark.delete({ where: { id: req.params.bookmarkId } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/users/:clerkId/alerts
 * Returns all active alerts for a user
 */
router.get('/:clerkId/alerts', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.params.clerkId },
      include: { alerts: { where: { active: true } } },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ alerts: user.alerts });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/users/:clerkId/alerts
 * Create an alert
 */
router.post('/:clerkId/alerts', async (req, res, next) => {
  try {
    const { alertType, config } = req.body;
    const user = await prisma.user.findUnique({
      where: { clerkId: req.params.clerkId },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const alert = await prisma.alert.create({
      data: {
        userId: user.id,
        alertType,
        config: config || {},
        active: true,
      },
    });

    res.status(201).json({ alert });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
