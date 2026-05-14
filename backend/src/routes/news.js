const express = require('express');
const router = express.Router();
const { fetchSpaceNews } = require('../services/apiService');

const VALID_TAGS = ['SpaceX', 'NASA', 'ISS', 'Mars', 'Moon', 'Launches', 'Webb', 'ESA', 'ISRO'];

/**
 * GET /api/news?limit=30&offset=0&tag=SpaceX
 * Returns aggregated space news articles
 */
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);
    const offset = parseInt(req.query.offset) || 0;
    const tag = req.query.tag;

    let data = await fetchSpaceNews(limit + (tag ? 50 : 0), offset);

    if (tag && VALID_TAGS.includes(tag)) {
      const filtered = data.results.filter(
        (article) =>
          article.title?.toLowerCase().includes(tag.toLowerCase()) ||
          article.summary?.toLowerCase().includes(tag.toLowerCase()) ||
          article.news_site?.toLowerCase().includes(tag.toLowerCase())
      );
      data = { ...data, results: filtered.slice(0, limit) };
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/news/tags
 * Returns available tag filters
 */
router.get('/tags', (req, res) => {
  res.json({ tags: VALID_TAGS });
});

module.exports = router;
