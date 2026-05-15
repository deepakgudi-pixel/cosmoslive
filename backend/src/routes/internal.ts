import { Router } from 'express';
import { isWarmCacheJobName, runWarmCacheJob } from '../jobs/cron.js';

const router = Router();

router.get('/cron/:jobName', async (req, res, next) => {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;
  const expectedAuthHeader = cronSecret ? `Bearer ${cronSecret}` : null;

  if (!cronSecret || authHeader !== expectedAuthHeader) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { jobName } = req.params;
  if (!isWarmCacheJobName(jobName)) {
    res.status(404).json({ error: 'Cron job not found' });
    return;
  }

  try {
    await runWarmCacheJob(jobName);
    res.json({ ok: true, job: jobName, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

export default router;
