import 'reflect-metadata';
import app from './app';
process.on('uncaughtException', (err) => {
  console.error('CRITICAL UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL UNHANDLED REJECTION:', reason);
});
import { env } from './config/env';
import { logInfo } from './logger/log.util';
import http from 'http';
import { SocketService } from './socket/socket.service';

const server = http.createServer(app);
SocketService.init(server);

server.listen(env.PORT, () => {
  logInfo(`Backend running on http://localhost:${env.PORT}`);
});
