import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'docker' ? '.env.docker' : '.env.local';

dotenv.config({ path: envFile });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is missing`);
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'local',
  PORT: process.env.PORT || '5001',
  MONGODB_URI: requireEnv('MONGODB_URI'),
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  JWT_SECRET: requireEnv('JWT_SECRET'),
};
