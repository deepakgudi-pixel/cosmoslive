require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const satelliteRoutes = require('./routes/satellites');
const launchRoutes = require('./routes/launches');
const issRoutes = require('./routes/iss');
const mediaRoutes = require('./routes/media');
const newsRoutes = require('./routes/news');
const userRoutes = require('./routes/users');

const { startCronJobs } = require('./jobs/cron');

const app = express();
const PORT = process.env.PORT || 4000;

// Trust proxy for Railway / Vercel deployments
app.set('trust proxy', 1);

// Security & performance middleware
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Global rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
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
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 CosmosLive API running on port ${PORT}`);
  startCronJobs();
});

module.exports = app;
