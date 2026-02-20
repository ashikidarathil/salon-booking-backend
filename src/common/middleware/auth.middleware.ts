import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env';
import { HttpStatus } from '../enums/httpStatus.enum';
import { MESSAGES } from '../constants/messages';
import type { AuthPayload } from '../types/authPayload';

export const authMiddleware = (
  req: Request & { auth?: AuthPayload },
  res: Response,
  next: NextFunction,
) => {
  const roleHeader = (req.headers['x-auth-role'] as string)?.toUpperCase();
  const currentTabId = req.headers['x-tab-id'] as string;

  if (!roleHeader) {
    return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Auth role header missing' });
  }

  const rolePrefix = roleHeader.toLowerCase();
  const accessToken = req.cookies?.[`${rolePrefix}_access_token`];

  if (!accessToken) {
    // If access token is missing, we return 401.
    // The frontend interceptor will catch this and try to call /refresh
    return res.status(HttpStatus.UNAUTHORIZED).json({ message: MESSAGES.AUTH.NO_TOKEN });
  }

  try {
    const decoded = jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET) as AuthPayload;

    if (decoded.tabId && currentTabId && decoded.tabId !== currentTabId) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Session conflict detected. Please refresh or login again.',
      });
    }

    if (decoded.role !== roleHeader) {
      return res.status(HttpStatus.FORBIDDEN).json({ message: 'Role mismatch' });
    }

    req.auth = decoded;
    next();
  } catch {
    return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Token expired' });
  }
};
