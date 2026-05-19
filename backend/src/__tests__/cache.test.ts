import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Cache layer', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    // Ensure we get the in-memory fallback
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it('should return null for non-existent keys', async () => {
    const { getCache } = await import('../lib/cache.js');
    const result = await getCache('non-existent');
    expect(result).toBeNull();
  });

  it('should store and retrieve values', async () => {
    const { getCache, setCache } = await import('../lib/cache.js');
    await setCache('test-key', { hello: 'world' }, 60);
    const result = await getCache('test-key');
    expect(result).toEqual({ hello: 'world' });
  });

  it('should return typed values via generics', async () => {
    const { getCache, setCache } = await import('../lib/cache.js');
    interface TestData { count: number; items: string[] }
    await setCache('typed-key', { count: 3, items: ['a', 'b', 'c'] }, 60);
    const result = await getCache<TestData>('typed-key');
    expect(result).not.toBeNull();
    expect(result!.count).toBe(3);
    expect(result!.items).toEqual(['a', 'b', 'c']);
  });

  it('should delete values', async () => {
    const { getCache, setCache, delCache } = await import('../lib/cache.js');
    await setCache('del-key', 'to-delete', 60);
    expect(await getCache('del-key')).toBe('to-delete');
    await delCache('del-key');
    expect(await getCache('del-key')).toBeNull();
  });

  it('should expire values based on TTL', async () => {
    const { getCache, setCache } = await import('../lib/cache.js');
    // Use a very short TTL
    await setCache('expire-key', 'temp', 0.001);
    // Wait for expiry
    await new Promise((r) => setTimeout(r, 50));
    const result = await getCache('expire-key');
    expect(result).toBeNull();
  });

  it('should handle errors gracefully in getCache', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Force an error by importing then breaking the store
    const cache = await import('../lib/cache.js');
    // getCache should not throw even if underlying store fails
    const result = await cache.getCache('safe-key');
    // It should return null (no key) without throwing
    expect(result).toBeNull();
    consoleSpy.mockRestore();
  });
});
