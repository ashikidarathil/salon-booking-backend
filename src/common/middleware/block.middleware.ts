import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/express';
import { clearAuthCookies } from '../utils/cookie.util';
import { HttpStatus } from '../enums/httpStatus.enum';
import { MESSAGES } from '../constants/messages';

export const blockMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.authUser?.isBlocked) {
    clearAuthCookies(res);
    return res.status(HttpStatus.FORBIDDEN).json({
      message: MESSAGES.COMMON.YOUR_ACC_IS_BLOCKED,
    });
  }

  next();
};
