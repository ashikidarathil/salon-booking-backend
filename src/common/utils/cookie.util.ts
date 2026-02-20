import type { Response } from 'express';
import { env } from '../../config/env';
import { UserRole } from '../enums/userRole.enum';
import jwt from 'jsonwebtoken';

import type { AuthPayload } from '../types/authPayload';

export function createAuthTokens(userId: string, role: UserRole, tabId?: string) {
  const payload: AuthPayload = { userId, role, tabId };

  const accessToken = jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES || '15m',
  });

  const refreshToken = jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES || '7d',
  });

  return { accessToken, refreshToken };
}

const isProd = env.NODE_ENV === 'production';

export const setAuthCookies = (
  res: Response,
  role: UserRole,
  tokens: { accessToken: string; refreshToken: string },
) => {
  const rolePrefix = role.toLowerCase();
  const baseOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
  };

  // Access Token: Short-lived (15m)
  res.cookie(`${rolePrefix}_access_token`, tokens.accessToken, {
    ...baseOptions,
    maxAge: 15 * 60 * 1000,
  });

  // Refresh Token: Long-lived (7d)
  res.cookie(`${rolePrefix}_refresh_token`, tokens.refreshToken, {
    ...baseOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookies = (res: Response, role?: UserRole) => {
  if (role) {
    const rolePrefix = role.toLowerCase();
    res.clearCookie(`${rolePrefix}_access_token`, { path: '/' });
    res.clearCookie(`${rolePrefix}_refresh_token`, { path: '/' });
  } else {
    // Clear all if no role specified (optional safety)
    res.clearCookie('user_access_token', { path: '/' });
    res.clearCookie('user_refresh_token', { path: '/' });
    res.clearCookie('admin_access_token', { path: '/' });
    res.clearCookie('admin_refresh_token', { path: '/' });
    res.clearCookie('stylist_access_token', { path: '/' });
    res.clearCookie('stylist_refresh_token', { path: '/' });
  }
};
