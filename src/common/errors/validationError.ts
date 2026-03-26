import { AppError } from './appError';
import { HttpStatus } from '../enums/httpStatus.enum';

export interface ValidationField {
  field: string;
  message: string;
}

export class ValidationError extends AppError {
  public readonly errors: ValidationField[];

  constructor(errors: ValidationField[]) {
    const message = errors.map((e) => `${e.field}: ${e.message}`).join(', ');
    super(message, HttpStatus.BAD_REQUEST);
    this.errors = errors;
  }
}
