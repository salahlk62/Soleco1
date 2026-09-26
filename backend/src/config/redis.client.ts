import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: null, // تم التعديل هنا ليتوافق مع BullMQ
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  console.log('⚡ Redis Client Connected Successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err);
});
