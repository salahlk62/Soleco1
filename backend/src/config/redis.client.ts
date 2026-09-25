import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
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
