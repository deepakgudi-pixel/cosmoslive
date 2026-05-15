import { describe, it, expect, vi } from 'vitest';

vi.mock('../lib/prisma.js', () => ({
  default: {
    user: { findUnique: vi.fn(), upsert: vi.fn() },
    bookmark: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn() },
    alert: { create: vi.fn() },
  },
}));

vi.mock('../jobs/cron.js', () => ({
  startCronJobs: vi.fn(),
}));

describe('API Server', () => {
  it('should export the express app correctly', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';
    const { default: app } = await import('../index.js');
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
    expect(typeof app.use).toBe('function');
  });
});
