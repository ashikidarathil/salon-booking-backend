import 'reflect-metadata';
import app from './app';
import { env } from './config/env';
import { logInfo } from './logger/log.util';
app.listen(env.PORT, () => {
  logInfo(`Backend running on http://localhost:${env.PORT}`);
});
