const express = require('express');
const router = express.Router();
const { fetchISSPosition, fetchISSCrew } = require('../services/apiService');

/**
 * GET /api/iss/position
 * Returns current ISS lat/lng position
 */
router.get('/position', async (req, res, next) => {
  try {
    const pos = await fetchISSPosition();
    res.json(pos);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/iss/crew
 * Returns current ISS crew members
 */
router.get('/crew', async (req, res, next) => {
  try {
    const crew = await fetchISSCrew();
    res.json({ count: crew.length, crew });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/iss/stream
 * Returns live stream URL info
 */
router.get('/stream', (req, res) => {
  res.json({
    url: 'https://www.youtube.com/embed/xAieE-QtOeM?autoplay=1&mute=1',
    source: 'NASA HDEV / ISS HD Earth Viewing',
    note: 'Embed this URL in an iframe. Feed may black out during ISS night passes.',
  });
});

module.exports = router;
