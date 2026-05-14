const { Redis } = require('@upstash/redis');

let redis;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
} else {
  // In-memory fallback for local dev without Redis credentials
  const store = new Map();
  redis = {
    get: async (key) => store.get(key) ?? null,
    set: async (key, value, opts) => {
      store.set(key, value);
      if (opts?.ex) setTimeout(() => store.delete(key), opts.ex * 1000);
      return 'OK';
    },
    del: async (key) => { store.delete(key); return 1; },
  };
  console.warn('⚠️  Upstash Redis not configured — using in-memory cache fallback');
}

/**
 * Get a value from cache
 * @param {string} key
 * @returns {Promise<any|null>}
 */
async function getCache(key) {
  try {
    const data = await redis.get(key);
    return data;
  } catch (err) {
    console.error('[Cache GET error]', key, err.message);
    return null;
  }
}

/**
 * Set a value in cache with TTL in seconds
 * @param {string} key
 * @param {any} value
 * @param {number} ttlSeconds
 */
async function setCache(key, value, ttlSeconds) {
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (err) {
    console.error('[Cache SET error]', key, err.message);
  }
}

/**
 * Delete a cache key
 * @param {string} key
 */
async function delCache(key) {
  try {
    await redis.del(key);
  } catch (err) {
    console.error('[Cache DEL error]', key, err.message);
  }
}

module.exports = { getCache, setCache, delCache };
