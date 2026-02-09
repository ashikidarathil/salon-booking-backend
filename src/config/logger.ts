import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { env } from './env';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  http: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
  http: 'magenta',
};

winston.addColors(colors);

/* ===================== FORMATS ===================== */

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf((info) => {
    return `[${info.level}] ${info.message}`;
  }),
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

/* ===================== TRANSPORTS ===================== */

const transports: winston.transport[] = [
  // ✅ CONSOLE (pretty)
  new winston.transports.Console({
    format: consoleFormat,
  }),

  // ✅ FILE: combined logs (JSON)
  new DailyRotateFile({
    filename: path.join('logs', 'combined', '%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: fileFormat,
  }),

  // ✅ FILE: error logs only
  new DailyRotateFile({
    level: 'error',
    filename: path.join('logs', 'errors', '%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: fileFormat,
  }),

  // ✅ FILE: http logs
  new DailyRotateFile({
    level: 'http',
    filename: path.join('logs', 'http', '%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '7d',
    format: fileFormat,
  }),
];

/* ===================== LOGGER ===================== */

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  transports,
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join('logs', 'exceptions', '%DATE%.log'),
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join('logs', 'rejections', '%DATE%.log'),
    }),
  ],
});
