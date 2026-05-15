import { Router } from 'express';
import { fetchISSPosition, fetchISSCrew } from '../services/index.js';

const router = Router();

router.get('/position', async (_req, res, next) => {
  try {
    const pos = await fetchISSPosition();
    res.json(pos);
  } catch (err) {
    next(err);
  }
});

router.get('/crew', async (_req, res, next) => {
  try {
    const crew = await fetchISSCrew();
    res.json({ count: crew.length, crew });
  } catch (err) {
    next(err);
  }
});

router.get('/stream', (_req, res) => {
  res.json({
    url: 'https://www.youtube.com/embed/FuuC4dpSQ1M?autoplay=1&mute=0&controls=0&modestbranding=1&rel=0&playsinline=1&disablekb=1&fs=0&iv_load_policy=3&enablejsapi=1',
    source: 'NASA ISS Live Stream',
    note: 'Embed this URL in an iframe. Feed may black out during ISS night passes.',
  });
});

export default router;
