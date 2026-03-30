"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = globalErrorHandler;
const appError_1 = require("./appError");
const httpStatus_enum_1 = require("../enums/httpStatus.enum");
const apiResponse_1 = require("../response/apiResponse");
const validationError_1 = require("./validationError");
const logger_1 = require("../../config/logger");
const messages_1 = require("../constants/messages");
function globalErrorHandler(err, req, res, _next) {
    if (err instanceof appError_1.AppError) {
        logger_1.logger.warn(messages_1.MESSAGES.COMMON.HANDLED_APP_ERROR, {
            message: err.message,
            statusCode: err.statusCode,
            method: req.method,
            url: req.originalUrl,
            userId: req.auth?.userId ?? 'anonymous',
        });
        if (err instanceof validationError_1.ValidationError) {
            res.status(err.statusCode).json({
                success: false,
                message: err.message,
                errors: err.errors,
            });
            return;
        }
        res.status(err.statusCode).json(new apiResponse_1.ApiResponse(false, err.message));
        return;
    }
    const message = err instanceof Error ? err.message : messages_1.MESSAGES.COMMON.UNKNOWN_ERROR;
    const stack = err instanceof Error ? err.stack : undefined;
    logger_1.logger.error(messages_1.MESSAGES.COMMON.UNHANDLED_ERROR, {
        message,
        stack,
        method: req.method,
        url: req.originalUrl,
        userId: req.auth?.userId ?? 'anonymous',
    });
    res
        .status(httpStatus_enum_1.HttpStatus.INTERNAL_SERVER_ERROR)
        .json(new apiResponse_1.ApiResponse(false, messages_1.MESSAGES.COMMON.INTERNAL_ERROR));
}
