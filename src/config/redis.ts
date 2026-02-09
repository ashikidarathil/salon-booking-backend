import { createClient } from 'redis';
import { env } from './env';
import { logInfo, logError } from '../logger/log.util';

const redisClient = createClient({ url: env.REDIS_URL });

redisClient.on('connect', () => logInfo('Redis connected'));
redisClient.on('error', (err) => logError('Redis error', err));

export const connectRedis = async () => {
  if (!redisClient.isOpen) await redisClient.connect();
};

export default redisClient;
