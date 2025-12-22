import { createClient } from 'redis';
import { env } from './env';
import { logger } from '../logger/logger';

const redisClient = createClient({ url: env.REDIS_URL });

redisClient.on('connect', () => logger.info('Redis connected'));
redisClient.on('error', (err) => logger.error('Redis error', err));

export const connectRedis = async () => {
  if (!redisClient.isOpen) await redisClient.connect();
};

export default redisClient;
