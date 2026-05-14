const express = require('express');
const router = express.Router();
const { fetchAPOD, fetchAPODArchive, fetchNASAImages } = require('../services/apiService');

/**
 * GET /api/media/apod
 * Returns today's NASA Astronomy Picture of the Day
 */
router.get('/apod', async (req, res, next) => {
  try {
    const data = await fetchAPOD();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/media/apod/archive?count=30
 * Returns random APOD images for gallery
 */
router.get('/apod/archive', async (req, res, next) => {
  try {
    const count = Math.min(parseInt(req.query.count) || 30, 100);
    const data = await fetchAPODArchive(count);
    res.json(data);
  } catch (err) {
    next(err);
  }
});


/**
 * GET /api/media/nasa?q=nebula&page=1
 * Returns NASA image library search results
 */
router.get('/nasa', async (req, res, next) => {
  try {
    const { q = 'deep space', page = 1 } = req.query;
    const collection = await fetchNASAImages(q, 'image', parseInt(page));
    res.json(collection);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
