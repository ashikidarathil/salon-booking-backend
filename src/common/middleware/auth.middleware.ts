import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env';
import { UserRole } from '../enums/userRole.enum';
import { HttpStatus } from '../enums/httpStatus.enum';
import { MESSAGES } from '../constants/messages';

export interface AuthPayload {
  userId: string;
  role: UserRole;
  tabId?: string;
}

export const authMiddleware = (
  req: Request & { auth?: AuthPayload },
  res: Response,
  next: NextFunction,
) => {
  const cookieToken = req.cookies?.access_token;
  const headerToken = req.headers.authorization?.split(' ')[1];
  const currentTabId = req.headers['x-tab-id'] as string;

  const token = headerToken || cookieToken;

  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({ message: MESSAGES.AUTH.NO_TOKEN });
  }

  try {
    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as AuthPayload;

    if (decoded.tabId && decoded.tabId !== currentTabId && currentTabId) {
      res.clearCookie('access_token', { path: '/' });
      res.clearCookie('refresh_token', { path: '/' });

      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Token is for a different tab. Please log in again.',
      });
    }

    req.auth = decoded;
    next();
  } catch {
    return res.status(HttpStatus.UNAUTHORIZED).json({ message: MESSAGES.AUTH.INVALID_TOKEN });
  }
};
