import { AlertType, BookmarkType, Prisma } from '@prisma/client';
import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

function parseJson(str: unknown): Prisma.InputJsonValue {
  if (str && typeof str === 'object') return str as Prisma.InputJsonValue;
  if (typeof str !== 'string') return {};

  try {
    const parsed = JSON.parse(str);
    return parsed && typeof parsed === 'object' ? parsed as Prisma.InputJsonValue : {};
  } catch {
    return {};
  }
}

router.post('/sync', async (req, res, next) => {
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

router.get('/:clerkId/bookmarks', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.params.clerkId },
      include: { bookmarks: { orderBy: { savedAt: 'desc' }, take: 100 } },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ bookmarks: user.bookmarks });
  } catch (err) {
    next(err);
  }
});

router.post('/:clerkId/bookmarks', async (req, res, next) => {
  try {
    const { type, referenceId, metadata } = req.body;
    if (!Object.values(BookmarkType).includes(type) || !referenceId) {
      return res.status(400).json({ error: 'Valid type and referenceId required' });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: req.params.clerkId },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const existing = await prisma.bookmark.findFirst({
      where: { userId: user.id, type, referenceId },
    });

    if (existing) {
      return res.json({ bookmark: existing, existing: true });
    }

    const bookmark = await prisma.bookmark.create({
      data: { userId: user.id, type, referenceId, metadata: parseJson(metadata) },
    });
    res.status(201).json({ bookmark });
  } catch (err) {
    next(err);
  }
});

router.delete('/:clerkId/bookmarks/:bookmarkId', async (req, res, next) => {
  try {
    const bookmark = await prisma.bookmark.findUnique({
      where: { id: req.params.bookmarkId },
      include: { user: true },
    });
    if (!bookmark) return res.status(404).json({ error: 'Bookmark not found' });
    if (bookmark.user.clerkId !== req.params.clerkId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await prisma.bookmark.delete({ where: { id: req.params.bookmarkId } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.get('/:clerkId/alerts', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.params.clerkId },
      include: { alerts: { where: { active: true }, orderBy: { createdAt: 'desc' }, take: 50 } },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ alerts: user.alerts });
  } catch (err) {
    next(err);
  }
});

router.post('/:clerkId/alerts', async (req, res, next) => {
  try {
    const { alertType, config } = req.body;
    if (!Object.values(AlertType).includes(alertType)) {
      return res.status(400).json({ error: 'Valid alertType required' });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: req.params.clerkId },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const parsedConfig = parseJson(config);
    const configRecord = parsedConfig as Record<string, unknown>;
    const referenceId = typeof configRecord.referenceId === 'string' ? configRecord.referenceId : undefined;

    if (referenceId) {
      const existing = await prisma.alert.findFirst({
        where: {
          userId: user.id,
          alertType,
          active: true,
          config: { path: ['referenceId'], equals: referenceId },
        },
      });

      if (existing) {
        return res.json({ alert: existing, existing: true });
      }
    }

    const alert = await prisma.alert.create({
      data: { userId: user.id, alertType, config: parsedConfig, active: true },
    });
    res.status(201).json({ alert });
  } catch (err) {
    next(err);
  }
});

router.delete('/:clerkId/alerts/:alertId', async (req, res, next) => {
  try {
    const alert = await prisma.alert.findUnique({
      where: { id: req.params.alertId },
      include: { user: true },
    });
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    if (alert.user.clerkId !== req.params.clerkId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.alert.update({
      where: { id: req.params.alertId },
      data: { active: false },
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
