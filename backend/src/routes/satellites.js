const express = require('express');
const router = express.Router();
const { fetchStarlinkPositions } = require('../services/apiService');

/**
 * GET /api/satellites/starlink
 * Returns all Starlink satellite positions
 */
router.get('/starlink', async (req, res, next) => {
  try {
    const data = await fetchStarlinkPositions();
    res.json({ count: data.length, satellites: data });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/satellites/starlink/:id
 * Returns a single Starlink satellite by ID
 */
router.get('/starlink/:id', async (req, res, next) => {
  try {
    const all = await fetchStarlinkPositions();
    const sat = all.find((s) => s.id === req.params.id);
    if (!sat) return res.status(404).json({ error: 'Satellite not found' });
    res.json(sat);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
