import { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError';
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
