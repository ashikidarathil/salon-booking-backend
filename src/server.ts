import 'reflect-metadata';
import app from './app';
import { env } from './config/env';
import { logger } from './logger/logger';

app.listen(env.PORT, () => {
  logger.info(`Backend running on http://localhost:${env.PORT}`);
});
