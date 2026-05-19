import { Redis } from '@upstash/redis';

interface CacheStore {
  get<T = unknown>(key: string): Promise<T | null>;
  set(key: string, value: unknown, opts?: { ex: number }): Promise<string>;
  del(key: string): Promise<number>;
}

let redis: CacheStore;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  }) as unknown as CacheStore;
} else {
  const store = new Map<string, { value: unknown; expiry: number }>();
  redis = {
    get: async <T = unknown>(key: string): Promise<T | null> => {
      const entry = store.get(key);
      if (!entry) return null;
      if (entry.expiry > 0 && Date.now() > entry.expiry) {
        store.delete(key);
        return null;
      }
      return entry.value as T;
    },
    set: async (key: string, value: unknown, opts?: { ex: number }): Promise<string> => {
      store.set(key, { value, expiry: opts?.ex ? Date.now() + opts.ex * 1000 : 0 });
      return 'OK';
    },
    del: async (key: string): Promise<number> => { store.delete(key); return 1; },
  };
  console.warn('Upstash Redis not configured — using in-memory cache fallback');
}

export async function getCache<T = unknown>(key: string): Promise<T | null> {
  try {
    return await redis.get<T>(key);
  } catch (err) {
    console.error('[Cache GET error]', key, (err as Error).message);
    return null;
  }
}

export async function setCache(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (err) {
    console.error('[Cache SET error]', key, (err as Error).message);
  }
}

export async function delCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (err) {
    console.error('[Cache DEL error]', key, (err as Error).message);
  }
}
