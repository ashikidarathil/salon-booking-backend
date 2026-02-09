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

  static success<T>(message: string, data?: T) {
    return new ApiResponse(true, message, data);
  }

  static error(message: string, errors?: Record<string, string[]>) {
    return new ApiResponse(false, message, undefined, errors);
  }
}
