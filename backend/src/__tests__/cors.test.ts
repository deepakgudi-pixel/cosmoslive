import { beforeEach, describe, expect, it, vi } from 'vitest';

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

describe('CORS origin matching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';
    delete process.env.FRONTEND_URL;
  });

  it('allows localhost requests with no origin header', async () => {
    const { isAllowedOrigin } = await import('../index.js');

    expect(isAllowedOrigin()).toBe(true);
  });

  it('allows configured frontend origin after normalization', async () => {
    process.env.FRONTEND_URL = 'https://cosmoslive-space.vercel.app/';
    const { isAllowedOrigin } = await import('../index.js');

    expect(isAllowedOrigin('https://cosmoslive-space.vercel.app')).toBe(true);
  });

  it('allows CosmosLive Vercel preview deployments', async () => {
    const { isAllowedOrigin } = await import('../index.js');

    expect(isAllowedOrigin('https://cosmoslive-space.vercel.app')).toBe(true);
    expect(isAllowedOrigin(' https://cosmoslive-git-main-team.vercel.app ')).toBe(true);
  });

  it('rejects unrelated origins', async () => {
    const { isAllowedOrigin } = await import('../index.js');

    expect(isAllowedOrigin('https://example.com')).toBe(false);
  });
});
