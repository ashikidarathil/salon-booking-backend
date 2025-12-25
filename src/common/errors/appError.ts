import { HttpStatus } from '../enums/httpStatus.enum';

export class AppError extends Error {
  public readonly statusCode: HttpStatus;
  public readonly isOperational = true;

  constructor(message: string, statusCode: HttpStatus) {
    super(message);
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}
