import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  bookmark: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  alert: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock('../lib/prisma.js', () => ({
  default: mockPrisma,
}));

vi.mock('../jobs/cron.js', () => ({
  startCronJobs: vi.fn(),
}));

async function createApp() {
  process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';
  const { default: app } = await import('../index.js');
  const http = await import('http');
  const server = http.createServer(app);
  await new Promise<void>((resolve) => { server.listen(0, () => resolve()); });
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 0;
  return { server, port, baseUrl: `http://127.0.0.1:${port}` };
}

describe('User Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/users/sync', () => {
    it('should create or update a user', async () => {
      const mockUser = { id: 'u1', clerkId: 'clerk_123', email: 'test@test.com', createdAt: new Date().toISOString() };
      mockPrisma.user.upsert.mockResolvedValue(mockUser);

      const { server, baseUrl } = await createApp();
      try {
        const res = await fetch(`${baseUrl}/api/users/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clerk_id: 'clerk_123', email: 'test@test.com' }),
        });
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.user.clerkId).toBe('clerk_123');
      } finally {
        server.close();
      }
    });

    it('should reject sync without clerk_id', async () => {
      const { server, baseUrl } = await createApp();
      try {
        const res = await fetch(`${baseUrl}/api/users/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@test.com' }),
        });

        expect(res.status).toBe(400);
      } finally {
        server.close();
      }
    });

    it('should reject sync with invalid email', async () => {
      const { server, baseUrl } = await createApp();
      try {
        const res = await fetch(`${baseUrl}/api/users/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clerk_id: 'clerk_123', email: 'not-an-email' }),
        });

        expect(res.status).toBe(400);
      } finally {
        server.close();
      }
    });
  });

  describe('GET /api/users/:clerkId/bookmarks', () => {
    it('should return bookmarks for a valid user', async () => {
      const mockBookmarks = [
        { id: 'b1', userId: 'u1', type: 'image', referenceId: 'ref1', metadata: {}, savedAt: new Date() },
      ];
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', clerkId: 'clerk_123' });
      mockPrisma.bookmark.findMany.mockResolvedValue(mockBookmarks);

      const { server, baseUrl } = await createApp();
      try {
        const res = await fetch(`${baseUrl}/api/users/clerk_123/bookmarks`);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.bookmarks).toHaveLength(1);
      } finally {
        server.close();
      }
    });

    it('should return 404 for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const { server, baseUrl } = await createApp();
      try {
        const res = await fetch(`${baseUrl}/api/users/nonexistent/bookmarks`);

        expect(res.status).toBe(404);
      } finally {
        server.close();
      }
    });
  });

  describe('POST /api/users/:clerkId/bookmarks', () => {
    it('should create a new bookmark', async () => {
      const mockUser = { id: 'u1', clerkId: 'clerk_123' };
      const mockBookmark = { id: 'b1', userId: 'u1', type: 'image', referenceId: 'img-001', metadata: {}, savedAt: new Date() };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.bookmark.findFirst.mockResolvedValue(null);
      mockPrisma.bookmark.create.mockResolvedValue(mockBookmark);

      const { server, baseUrl } = await createApp();
      try {
        const res = await fetch(`${baseUrl}/api/users/clerk_123/bookmarks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'image', referenceId: 'img-001' }),
        });
        const data = await res.json();

        expect(res.status).toBe(201);
        expect(data.bookmark.referenceId).toBe('img-001');
      } finally {
        server.close();
      }
    });

    it('should return existing bookmark if duplicate', async () => {
      const mockUser = { id: 'u1', clerkId: 'clerk_123' };
      const existing = { id: 'b1', userId: 'u1', type: 'image', referenceId: 'img-001', metadata: {}, savedAt: new Date() };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.bookmark.findFirst.mockResolvedValue(existing);

      const { server, baseUrl } = await createApp();
      try {
        const res = await fetch(`${baseUrl}/api/users/clerk_123/bookmarks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'image', referenceId: 'img-001' }),
        });
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.existing).toBe(true);
      } finally {
        server.close();
      }
    });

    it('should reject invalid bookmark type', async () => {
      const { server, baseUrl } = await createApp();
      try {
        const res = await fetch(`${baseUrl}/api/users/clerk_123/bookmarks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'invalid_type', referenceId: 'ref1' }),
        });

        expect(res.status).toBe(400);
      } finally {
        server.close();
      }
    });
  });

  describe('DELETE /api/users/:clerkId/bookmarks/:bookmarkId', () => {
    it('should delete own bookmark', async () => {
      const mockUser = { id: 'u1', clerkId: 'clerk_123' };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.bookmark.findUnique.mockResolvedValue({ id: 'b1', userId: 'u1' });
      mockPrisma.bookmark.delete.mockResolvedValue({});

      const { server, baseUrl } = await createApp();
      try {
        const res = await fetch(`${baseUrl}/api/users/clerk_123/bookmarks/b1`, { method: 'DELETE' });
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
      } finally {
        server.close();
      }
    });

    it('should return 403 when deleting another users bookmark', async () => {
      const mockUser = { id: 'u1', clerkId: 'clerk_123' };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.bookmark.findUnique.mockResolvedValue({ id: 'b1', userId: 'u2' }); // Different user

      const { server, baseUrl } = await createApp();
      try {
        const res = await fetch(`${baseUrl}/api/users/clerk_123/bookmarks/b1`, { method: 'DELETE' });

        expect(res.status).toBe(403);
      } finally {
        server.close();
      }
    });
  });

  describe('Alert routes', () => {
    it('should list active alerts', async () => {
      const mockUser = { id: 'u1', clerkId: 'clerk_123' };
      const mockAlerts = [
        { id: 'a1', userId: 'u1', alertType: 'launch', config: {}, active: true, createdAt: new Date() },
      ];
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.alert.findMany.mockResolvedValue(mockAlerts);

      const { server, baseUrl } = await createApp();
      try {
        const res = await fetch(`${baseUrl}/api/users/clerk_123/alerts`);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.alerts).toHaveLength(1);
      } finally {
        server.close();
      }
    });

    it('should create an alert', async () => {
      const mockUser = { id: 'u1', clerkId: 'clerk_123' };
      const mockAlert = { id: 'a1', userId: 'u1', alertType: 'launch', config: {}, active: true, createdAt: new Date() };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.alert.create.mockResolvedValue(mockAlert);

      const { server, baseUrl } = await createApp();
      try {
        const res = await fetch(`${baseUrl}/api/users/clerk_123/alerts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alertType: 'launch' }),
        });
        const data = await res.json();

        expect(res.status).toBe(201);
        expect(data.alert.alertType).toBe('launch');
      } finally {
        server.close();
      }
    });

    it('should soft-delete (deactivate) own alert', async () => {
      const mockUser = { id: 'u1', clerkId: 'clerk_123' };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.alert.findUnique.mockResolvedValue({ id: 'a1', userId: 'u1', active: true });
      mockPrisma.alert.update.mockResolvedValue({ id: 'a1', active: false });

      const { server, baseUrl } = await createApp();
      try {
        const res = await fetch(`${baseUrl}/api/users/clerk_123/alerts/a1`, { method: 'DELETE' });
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
      } finally {
        server.close();
      }
    });

    it('should return 403 when deactivating another users alert', async () => {
      const mockUser = { id: 'u1', clerkId: 'clerk_123' };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.alert.findUnique.mockResolvedValue({ id: 'a1', userId: 'u2', active: true }); // Different user

      const { server, baseUrl } = await createApp();
      try {
        const res = await fetch(`${baseUrl}/api/users/clerk_123/alerts/a1`, { method: 'DELETE' });

        expect(res.status).toBe(403);
      } finally {
        server.close();
      }
    });
  });
});
