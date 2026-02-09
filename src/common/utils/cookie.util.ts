/*
import type { Response } from 'express';
import { env } from '../../config/env';
import { UserRole } from '../enums/userRole.enum';
import * as jwt from 'jsonwebtoken';

export function createAuthTokens(userId: string, role: UserRole, tabId?: string) {
  const payload = { userId, role, tabId };

  const accessToken = jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES,
  });

  const refreshToken = jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES,
  });

  return { accessToken, refreshToken };
}

const isProd = env.NODE_ENV === 'production';

export const setAuthCookies = (
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
) => {
  const baseOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
  };

  res.cookie('access_token', tokens.accessToken, {
    ...baseOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refresh_token', tokens.refreshToken, {
    ...baseOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/' });
};
*/

import type { Response } from 'express';
import { env } from '../../config/env';
import { UserRole } from '../enums/userRole.enum';
import jwt from 'jsonwebtoken';

export function createSessionToken(userId: string, role: UserRole, tabId?: string) {
  return jwt.sign({ userId, role, tabId }, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES,
  });
}

const isProd = env.NODE_ENV === 'production';

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie('refresh_token', { path: '/' });
};
