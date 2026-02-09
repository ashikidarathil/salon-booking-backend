import type { Request } from 'express';
import type { AuthPayload } from './authPayload';
import type { AuthUser } from './authUser';

export interface AuthenticatedRequest extends Request {
  auth?: AuthPayload;
  authUser?: AuthUser;
}
