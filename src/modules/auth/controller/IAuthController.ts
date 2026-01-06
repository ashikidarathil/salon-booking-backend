import type { Request, Response } from 'express';

export interface IAuthController {
  signup(req: Request, res: Response): Promise<void>;
  verifyOtp(req: Request, res: Response): Promise<void>;
  login(req: Request, res: Response): Promise<void>;
  forgotPassword(req: Request, res: Response): Promise<void>;
  resetPassword(req: Request, res: Response): Promise<void>;
  googleLogin(req: Request, res: Response): Promise<void>;
  refresh(req: Request, res: Response): Promise<void>;
  me(req: Request & { auth?: { userId: string } }, res: Response): Promise<void>;
  logout(req: Request, res: Response): Promise<void>;
  sendSmsOtp(req: Request, res: Response): Promise<void>;
  // verifySmsOtp(req: Request, res: Response): Promise<void>;
  verifySignupSmsOtp(req: Request, res: Response): Promise<void>;
  resendEmailOtp(req: Request, res: Response): Promise<void>;
  resendSmsOtp(req: Request, res: Response): Promise<void>;
  applyAsStylist(req: Request, res: Response): Promise<void>;

  verifyResetOtp(req: Request, res: Response): Promise<void>;
  resendResetOtp(req: Request, res: Response): Promise<void>;

  uploadProfilePicture(req: Request & { auth?: { userId: string } }, res: Response): Promise<void>;

  updateProfilePicture(req: Request & { auth?: { userId: string } }, res: Response): Promise<void>;
}
