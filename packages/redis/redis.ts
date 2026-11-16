import { createClient } from 'redis';

export const redisClient = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
  },
});

redisClient.on('error', (err) => {
  console.warn('[Redis] Warning - Redis Client Error:', err?.message || err);
});

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log('✅ Connected to Redis cache successfully');
    }
  } catch (err) {
    console.warn(
      '⚠️ Redis connection failed, falling back to direct database queries:',
      err,
    );
  }
};

/**
 * Safely get cached data from Redis. Returns null on miss or error.
 */
export const getCache = async <T = any>(key: string): Promise<T | null> => {
  try {
    if (!redisClient.isOpen) return null;
    const data = await redisClient.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (err) {
    console.warn(`[Redis] getCache error for key ${key}:`, err);
    return null;
  }
};

/**
 * Safely set cached data in Redis with TTL in seconds (default: 15 minutes = 900s).
 */
export const setCache = async (
  key: string,
  value: any,
  ttlSeconds: number = 900,
): Promise<void> => {
  try {
    if (!redisClient.isOpen) return;
    const serialized = JSON.stringify(value);
    await redisClient.set(key, serialized, { EX: ttlSeconds });
  } catch (err) {
    console.warn(`[Redis] setCache error for key ${key}:`, err);
  }
};

/**
 * Safely delete a specific cache key from Redis.
 */
export const delCache = async (key: string): Promise<void> => {
  try {
    if (!redisClient.isOpen) return;
    await redisClient.del(key);
  } catch (err) {
    console.warn(`[Redis] delCache error for key ${key}:`, err);
  }
};

/**
 * Safely delete all keys matching a glob pattern (e.g. "cache:products:*").
 */
export const delCacheByPattern = async (pattern: string): Promise<void> => {
  try {
    if (!redisClient.isOpen) return;
    const keys = await redisClient.keys(pattern);
    if (keys && keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (err) {
    console.warn(`[Redis] delCacheByPattern error for pattern ${pattern}:`, err);
  }
};
