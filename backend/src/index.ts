import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import satelliteRoutes from './routes/satellites.js';
import launchRoutes from './routes/launches.js';
import issRoutes from './routes/iss.js';
import mediaRoutes from './routes/media.js';
import newsRoutes from './routes/news.js';
import userRoutes from './routes/users.js';
import internalRoutes from './routes/internal.js';
import { startCronJobs } from './jobs/cron.js';
import { getErrorResponse } from './lib/errors.js';

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

function normalizeOrigin(origin: string) {
  try {
    return new URL(origin.trim()).origin;
  } catch {
    return null;
  }
}

export function isAllowedOrigin(origin?: string) {
  if (!origin) return true;

  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) return false;

  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL,
  ]
    .filter(Boolean)
    .map((value) => normalizeOrigin(value!))
    .filter((value): value is string => Boolean(value));

  if (allowedOrigins.includes(normalizedOrigin)) {
    return true;
  }

  const { hostname } = new URL(normalizedOrigin);
  const isCodespacesPreview = /^[a-z0-9-]+-3000\.app\.github\.dev$/i.test(hostname);
  const isVercelPreview = hostname.endsWith('.vercel.app') && hostname.split('.')[0].startsWith('cosmoslive');

  return isCodespacesPreview || isVercelPreview;
}

// Security & performance middleware
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
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
app.use('/api/internal', internalRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const errorResponse = getErrorResponse(err);
  const error = err instanceof Error ? err : null;

  console.error('[Error]', {
    method: req.method,
    path: req.originalUrl,
    status: errorResponse.status,
    code: errorResponse.code,
    message: error?.message ?? errorResponse.message,
    stack: error?.stack,
  });

  res.status(errorResponse.status).json({
    error: errorResponse.message,
    code: errorResponse.code,
  });
});

const isVercelRuntime = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

if (process.env.VITEST !== 'true' && !isVercelRuntime) {
  app.listen(PORT, () => {
    console.log(`CosmosLive API running on port ${PORT}`);
    startCronJobs();
  });
}

export default app;
