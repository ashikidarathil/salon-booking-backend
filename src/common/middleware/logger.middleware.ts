import type { Response, NextFunction } from 'express';
import { logger } from '../../config/logger';
import type { AuthenticatedRequest } from '../types/express';

export const loggerMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;

    logger.http('HTTP Request', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs,
      ip: req.ip,
      userId: req.auth?.userId ?? 'anonymous',
      userAgent: req.get('user-agent') ?? 'unknown',
    });
  });

  next();
};
