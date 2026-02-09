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
  const token = req.cookies?.refresh_token;
  const currentTabId = req.headers['x-tab-id'] as string;

  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({ message: MESSAGES.AUTH.NO_TOKEN });
  }

  try {
    const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as AuthPayload;

    if (decoded.tabId && currentTabId && decoded.tabId !== currentTabId) {
      res.clearCookie('refresh_token');
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Session expired. Please login again.',
      });
    }

    req.auth = decoded;
    next();
  } catch {
    res.clearCookie('refresh_token');
    return res.status(HttpStatus.UNAUTHORIZED).json({ message: MESSAGES.AUTH.INVALID_TOKEN });
  }
};
