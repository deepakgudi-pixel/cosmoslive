const express = require('express');
const router = express.Router();
const { fetchLaunches, fetchSpaceXData } = require('../services/apiService');

/**
 * GET /api/launches/upcoming
 * Returns upcoming launches from all agencies (Launch Library 2)
 */
router.get('/upcoming', async (req, res, next) => {
  try {
    const data = await fetchLaunches();
    res.json(data.upcoming);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/launches/previous
 * Returns recent past launches
 */
router.get('/previous', async (req, res, next) => {
  try {
    const data = await fetchLaunches();
    res.json(data.previous);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/launches/spacex
 * Returns SpaceX-specific launch and rocket data
 */
router.get('/spacex', async (req, res, next) => {
  try {
    const data = await fetchSpaceXData();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/launches/spacex/upcoming
 * Returns upcoming SpaceX launches
 */
router.get('/spacex/upcoming', async (req, res, next) => {
  try {
    const data = await fetchSpaceXData();
    res.json(data.upcomingLaunches);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
