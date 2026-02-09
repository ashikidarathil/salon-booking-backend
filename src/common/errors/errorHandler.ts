/*
import { Request, Response, NextFunction } from 'express';
import { AppError } from './appError';
import { HttpStatus } from '../enums/httpStatus.enum';

export function globalErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error('UNHANDLED ERROR:', err);

  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Something went wrong',
  });
}
*/

import type { Response, NextFunction } from 'express';
import { AppError } from './appError';
import { HttpStatus } from '../enums/httpStatus.enum';
import { ApiResponse } from '../response/apiResponse';
import { logger } from '../../config/logger';
import { MESSAGES } from '../constants/messages';
import type { AuthenticatedRequest } from '../types/express';

export function globalErrorHandler(
  err: unknown,
  req: AuthenticatedRequest,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    logger.warn(MESSAGES.COMMON.HANDLED_APP_ERROR, {
      message: err.message,
      statusCode: err.statusCode,
      method: req.method,
      url: req.originalUrl,
      userId: req.auth?.userId ?? 'anonymous',
    });

    res.status(err.statusCode).json(new ApiResponse(false, err.message));
    return;
  }

  const message = err instanceof Error ? err.message : MESSAGES.COMMON.UNKNOWN_ERROR;
  const stack = err instanceof Error ? err.stack : undefined;

  logger.error(MESSAGES.COMMON.UNHANDLED_ERROR, {
    message,
    stack,
    method: req.method,
    url: req.originalUrl,
    userId: req.auth?.userId ?? 'anonymous',
  });

  res
    .status(HttpStatus.INTERNAL_SERVER_ERROR)
    .json(new ApiResponse(false, MESSAGES.COMMON.INTERNAL_ERROR));
}
