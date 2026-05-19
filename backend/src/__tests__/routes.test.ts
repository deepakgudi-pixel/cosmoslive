import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/prisma.js', () => ({
  default: {
    user: { findUnique: vi.fn(), upsert: vi.fn() },
    bookmark: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), delete: vi.fn() },
    alert: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
  },
}));

vi.mock('../jobs/cron.js', () => ({
  startCronJobs: vi.fn(),
}));

describe('API Server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export the express app correctly', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';
    const { default: app } = await import('../index.js');
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
    expect(typeof app.use).toBe('function');
  });

  it('should respond to health check', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';
    const { default: app } = await import('../index.js');

    // Use a simple supertest-like approach
    const express = await import('express');
    const http = await import('http');
    
    const server = http.createServer(app);
    
    await new Promise<void>((resolve) => {
      server.listen(0, () => resolve());
    });
    
    const addr = server.address();
    const port = typeof addr === 'object' && addr ? addr.port : 0;
    
    try {
      const res = await fetch(`http://127.0.0.1:${port}/health`);
      const data = await res.json();
      
      expect(res.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.service).toBe('CosmosLive API');
      expect(data.version).toBe('1.0.0');
      expect(data.timestamp).toBeDefined();
    } finally {
      server.close();
    }
  });

  it('should return 404 for unknown routes', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';
    const { default: app } = await import('../index.js');

    const http = await import('http');
    const server = http.createServer(app);
    
    await new Promise<void>((resolve) => {
      server.listen(0, () => resolve());
    });
    
    const addr = server.address();
    const port = typeof addr === 'object' && addr ? addr.port : 0;
    
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/nonexistent`);
      const data = await res.json();
      
      expect(res.status).toBe(404);
      expect(data.error).toBe('Route not found');
    } finally {
      server.close();
    }
  });
});
