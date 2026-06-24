const Redis = require('ioredis');

let redisClient = null;
let isRedisConnected = false;

// Local memory cache fallback
const memoryCache = new Map();

if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null, // required for BullMQ
      enableReadyCheck: false,
      connectTimeout: 5000,
      retryStrategy(times) {
        if (times > 3) {
          console.warn('⚠️ Redis connection failed repeatedly. Switching to memory cache fallback.');
          return null; // Stop retrying
        }
        return Math.min(times * 100, 2000);
      }
    });

    redisClient.on('connect', () => {
      console.log('🔌 Connected to Redis cache service.');
      isRedisConnected = true;
    });

    redisClient.on('error', (err) => {
      console.warn('⚠️ Redis error observed:', err.message);
      isRedisConnected = false;
    });
  } catch (error) {
    console.error('❌ Failed to initialize Redis client:', error.message);
  }
} else {
  console.log('⚠️ REDIS_URL not configured. Operating in memory cache mode.');
}

const cacheService = {
  get: async (key) => {
    if (isRedisConnected && redisClient) {
      try {
        const val = await redisClient.get(key);
        return val ? JSON.parse(val) : null;
      } catch (err) {
        return memoryCache.get(key) || null;
      }
    }
    return memoryCache.get(key) || null;
  },

  set: async (key, value, ttlSeconds = 3600) => {
    if (isRedisConnected && redisClient) {
      try {
        await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        return;
      } catch (err) {
        // Fallback to memory
      }
    }
    memoryCache.set(key, value);
    // Set memory cache timeout
    setTimeout(() => {
      memoryCache.delete(key);
    }, ttlSeconds * 1000);
  },

  del: async (key) => {
    if (isRedisConnected && redisClient) {
      try {
        await redisClient.del(key);
        return;
      } catch (err) {
        // Fallback
      }
    }
    memoryCache.delete(key);
  },

  getClient: () => redisClient,
  isConnected: () => isRedisConnected
};

module.exports = cacheService;
