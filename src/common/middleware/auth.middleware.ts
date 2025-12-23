import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env';
import { UserRole } from '../enums/userRole.enum';
import { HttpStatus } from '../enums/httpStatus.enum';
import { MESSAGES } from '../../common/constants/messages';

export interface AuthPayload {
  userId: string;
  role: UserRole;
}

export const authMiddleware = (
  req: Request & { auth?: AuthPayload },
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(HttpStatus.UNAUTHORIZED).json({ message: MESSAGES.AUTH.NO_TOKEN });

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.auth = decoded;
    next();
  } catch {
    return res.status(HttpStatus.UNAUTHORIZED).json({ message: MESSAGES.AUTH.INVALID_TOKEN });
  }
};
