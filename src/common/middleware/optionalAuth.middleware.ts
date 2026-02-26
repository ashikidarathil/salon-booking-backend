import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env';
import type { AuthPayload } from '../types/authPayload';

export const optionalAuthMiddleware = (
  req: Request & { auth?: AuthPayload },
  res: Response,
  next: NextFunction,
) => {
  const roleHeader = (req.headers['x-auth-role'] as string)?.toUpperCase();
  const currentTabId = req.headers['x-tab-id'] as string;

  if (!roleHeader) {
    return next();
  }

  const rolePrefix = roleHeader.toLowerCase();
  const accessToken = req.cookies?.[`${rolePrefix}_access_token`];

  if (!accessToken) {
    return next();
  }

  try {
    const decoded = jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET) as AuthPayload;

    if (decoded.tabId && currentTabId && decoded.tabId !== currentTabId) {
      // For optional auth, we just ignore invalid tab ID
      return next();
    }

    if (decoded.role === roleHeader) {
      req.auth = decoded;
    }
    next();
  } catch {
    // If token is invalid or expired, just proceed without req.auth
    next();
  }
};
