import { Response } from 'express';

export class ApiResponse<T = void> {
  timestamp: string;

  constructor(
    public success: boolean,
    public message: string,
    public data?: T,
    public errors?: Record<string, string[]>,
  ) {
    this.timestamp = new Date().toISOString();
  }

  static success<T>(
    res: Response,
    data?: T,
    message: string = 'Operation successful',
    status: number = 200,
  ) {
    return res.status(status).json(new ApiResponse(true, message, data));
  }

  static error(
    res: Response,
    message: string = 'Operation failed',
    status: number = 400,
    errors?: Record<string, string[]>,
  ) {
    return res.status(status).json(new ApiResponse(false, message, undefined, errors));
  }
}
