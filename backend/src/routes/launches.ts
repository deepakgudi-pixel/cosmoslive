import { Router } from 'express';
import { fetchLaunches, fetchSpaceXData } from '../services/index.js';

const router = Router();

router.get('/upcoming', async (_req, res, next) => {
  try {
    const data = await fetchLaunches();
    res.json(data.upcoming);
  } catch (err) {
    next(err);
  }
});

router.get('/previous', async (_req, res, next) => {
  try {
    const data = await fetchLaunches();
    res.json(data.previous);
  } catch (err) {
    next(err);
  }
});

router.get('/spacex', async (_req, res, next) => {
  try {
    const data = await fetchSpaceXData();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/spacex/upcoming', async (_req, res, next) => {
  try {
    const data = await fetchSpaceXData();
    res.json(data.upcomingLaunches);
  } catch (err) {
    next(err);
  }
});

export default router;
