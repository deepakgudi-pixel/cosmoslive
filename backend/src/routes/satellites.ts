import { Router } from 'express';
import { fetchStarlinkPositions } from '../services';

const router = Router();

router.get('/starlink', async (_req, res, next) => {
  try {
    const data = await fetchStarlinkPositions();
    res.json({ count: data.length, satellites: data });
  } catch (err) {
    next(err);
  }
});

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

export default router;
