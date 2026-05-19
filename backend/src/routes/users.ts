import { AlertType, BookmarkType, Prisma } from '@prisma/client';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import prisma from '../lib/prisma.js';

const router = Router();

// ── Tighter rate limits for write operations ──────────────
const writeLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many write requests, please slow down.' },
});

// ── Request body schemas ──────────────────────────────────
const SyncBodySchema = z.object({
  clerk_id: z.string().min(1),
  email: z.string().email(),
});

const CreateBookmarkBodySchema = z.object({
  type: z.nativeEnum(BookmarkType),
  referenceId: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

const CreateAlertBodySchema = z.object({
  alertType: z.nativeEnum(AlertType),
  config: z.record(z.string(), z.unknown()).optional().default({}),
});

function toJsonValue(obj: Record<string, unknown>): Prisma.InputJsonValue {
  return obj as Prisma.InputJsonValue;
}

// ── Ownership guard ───────────────────────────────────────
// Ensures the clerkId in the URL belongs to the requesting user.
// In a full setup this would verify the Clerk session JWT, but at
// minimum we validate the user exists and the param is well-formed.
async function resolveUser(clerkId: string) {
  if (!clerkId || clerkId.length < 3) return null;
  return prisma.user.findUnique({ where: { clerkId } });
}

// ── Sync ──────────────────────────────────────────────────
router.post('/sync', writeLimit, async (req, res, next) => {
  try {
    const parsed = SyncBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Valid clerk_id and email required', details: parsed.error.flatten().fieldErrors });
    }

    const { clerk_id, email } = parsed.data;
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

// ── Bookmarks: List ───────────────────────────────────────
router.get('/:clerkId/bookmarks', async (req, res, next) => {
  try {
    const user = await resolveUser(req.params.clerkId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      orderBy: { savedAt: 'desc' },
      take: 100,
    });
    res.json({ bookmarks });
  } catch (err) {
    next(err);
  }
});

// ── Bookmarks: Create ─────────────────────────────────────
router.post('/:clerkId/bookmarks', writeLimit, async (req, res, next) => {
  try {
    const parsed = CreateBookmarkBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Valid type and referenceId required', details: parsed.error.flatten().fieldErrors });
    }

    const { type, referenceId, metadata } = parsed.data;
    const clerkId = String(req.params.clerkId);

    const user = await resolveUser(clerkId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const existing = await prisma.bookmark.findFirst({
      where: { userId: user.id, type, referenceId },
    });

    if (existing) {
      return res.json({ bookmark: existing, existing: true });
    }

    const bookmark = await prisma.bookmark.create({
      data: { userId: user.id, type, referenceId, metadata: toJsonValue(metadata) },
    });
    res.status(201).json({ bookmark });
  } catch (err) {
    next(err);
  }
});

// ── Bookmarks: Delete ─────────────────────────────────────
router.delete('/:clerkId/bookmarks/:bookmarkId', writeLimit, async (req, res, next) => {
  try {
    const clerkId = String(req.params.clerkId);
    const bookmarkId = String(req.params.bookmarkId);

    const user = await resolveUser(clerkId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const bookmark = await prisma.bookmark.findUnique({
      where: { id: bookmarkId },
    });
    if (!bookmark) return res.status(404).json({ error: 'Bookmark not found' });
    if (bookmark.userId !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await prisma.bookmark.delete({ where: { id: bookmarkId } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ── Alerts: List ──────────────────────────────────────────
router.get('/:clerkId/alerts', async (req, res, next) => {
  try {
    const user = await resolveUser(req.params.clerkId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const alerts = await prisma.alert.findMany({
      where: { userId: user.id, active: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ alerts });
  } catch (err) {
    next(err);
  }
});

// ── Alerts: Create ────────────────────────────────────────
router.post('/:clerkId/alerts', writeLimit, async (req, res, next) => {
  try {
    const parsed = CreateAlertBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Valid alertType required', details: parsed.error.flatten().fieldErrors });
    }

    const { alertType, config } = parsed.data;
    const clerkId = String(req.params.clerkId);

    const user = await resolveUser(clerkId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const referenceId = typeof config.referenceId === 'string' ? config.referenceId : undefined;

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
      data: { userId: user.id, alertType, config: toJsonValue(config), active: true },
    });
    res.status(201).json({ alert });
  } catch (err) {
    next(err);
  }
});

// ── Alerts: Delete ────────────────────────────────────────
router.delete('/:clerkId/alerts/:alertId', writeLimit, async (req, res, next) => {
  try {
    const clerkId = String(req.params.clerkId);
    const alertId = String(req.params.alertId);

    const user = await resolveUser(clerkId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
    });
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    if (alert.userId !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.alert.update({
      where: { id: alertId },
      data: { active: false },
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
