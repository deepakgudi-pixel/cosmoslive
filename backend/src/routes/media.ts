import { Router } from 'express';
import { fetchAPOD, fetchAPODArchive, fetchNASAImages, fetchMarsPhotos } from '../services';

const router = Router();

router.get('/apod', async (_req, res, next) => {
  try {
    const data = await fetchAPOD();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/apod/archive', async (req, res, next) => {
  try {
    const count = Math.min(parseInt(req.query.count as string) || 30, 100);
    const data = await fetchAPODArchive(count);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/nasa', async (req, res, next) => {
  try {
    const q = (req.query.q as string) || 'deep space';
    const page = parseInt(req.query.page as string) || 1;
    const collection = await fetchNASAImages(q, 'image', page);
    res.json(collection);
  } catch (err) {
    next(err);
  }
});

// Mars photos route
router.get('/mars', async (req, res, next) => {
  try {
    const rover = (req.query.rover as string) || 'perseverance';
    const sol = req.query.sol ? parseInt(req.query.sol as string) : null;
    const photos = await fetchMarsPhotos(rover, sol);
    res.json(photos);
  } catch (err) {
    next(err);
  }
});

export default router;
