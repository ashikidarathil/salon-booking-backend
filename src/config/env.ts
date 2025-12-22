import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || '5001',
  MONGODB_URI: process.env.MONGODB_URI as string,
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  JWT_SECRET: process.env.JWT_SECRET as string,
};

if (!env.MONGODB_URI) throw new Error('MONGODB_URI missing in .env');
if (!env.JWT_SECRET) throw new Error('JWT_SECRET missing in .env');
