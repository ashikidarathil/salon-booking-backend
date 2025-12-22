import type { Request, Response } from 'express';

export interface IAuthController {
  signup(req: Request, res: Response): Promise<void>;
  verifyOtp(req: Request, res: Response): Promise<void>;
  login(req: Request, res: Response): Promise<void>;
  forgotPassword(req: Request, res: Response): Promise<void>;
  resetPassword(req: Request, res: Response): Promise<void>;
}
