import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import satelliteRoutes from './routes/satellites';
import launchRoutes from './routes/launches';
import issRoutes from './routes/iss';
import mediaRoutes from './routes/media';
import newsRoutes from './routes/news';
import userRoutes from './routes/users';
import { startCronJobs } from './jobs/cron';

// ── Env validation at startup ─────────────────────────────
const REQUIRED_VARS = ['DATABASE_URL'];
const MISSING = REQUIRED_VARS.filter((v) => !process.env[v]);
if (MISSING.length > 0) {
  console.error(`Missing required env vars: ${MISSING.join(', ')}`);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 4000;

app.set('trust proxy', 1);

// Security & performance middleware
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL,
    ].filter(Boolean);

    const isCodespacesPreview = Boolean(
      origin &&
      /^https:\/\/[a-z0-9-]+-3000\.app\.github\.dev$/i.test(origin)
    );

    if (!origin || allowedOrigins.includes(origin) || isCodespacesPreview) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Global rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
});
app.use(limiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'CosmosLive API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/satellites', satelliteRoutes);
app.use('/api/launches', launchRoutes);
app.use('/api/iss', issRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

if (process.env.VITEST !== 'true') {
  app.listen(PORT, () => {
    console.log(`CosmosLive API running on port ${PORT}`);
    startCronJobs();
  });
}

export default app;
