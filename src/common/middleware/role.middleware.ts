import type { Request, Response, NextFunction } from 'express';
import { UserRole } from '../enums/userRole.enum';
import { HttpStatus } from '../enums/httpStatus.enum';
import { MESSAGES } from '../../common/constants/messages';
import type { AuthPayload } from './auth.middleware';

export const roleMiddleware =
  (roles: UserRole[]) =>
  (req: Request & { auth?: AuthPayload }, res: Response, next: NextFunction) => {
    if (!req.auth)
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: MESSAGES.AUTH.UNAUTHORIZED });
    if (!roles.includes(req.auth.role))
      return res.status(HttpStatus.FORBIDDEN).json({ message: MESSAGES.AUTH.FORBIDDEN });
    next();
  };
