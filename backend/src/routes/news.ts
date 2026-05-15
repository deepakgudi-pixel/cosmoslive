import { Router } from 'express';
import { fetchFilteredNews, VALID_NEWS_TAGS } from '../services/index.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 30, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const tag = req.query.tag as string | undefined;
    const data = await fetchFilteredNews(limit, offset, tag);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/tags', (_req, res) => {
  res.json({ tags: VALID_NEWS_TAGS });
});

export default router;
