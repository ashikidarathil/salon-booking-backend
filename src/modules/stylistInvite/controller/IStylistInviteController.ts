import type { Request, Response } from 'express';

export interface IStylistInviteController {
  createInvite(req: Request, res: Response): Promise<void>;
  validate(req: Request, res: Response): Promise<void>;
  accept(req: Request, res: Response): Promise<void>;
  approve(req: Request, res: Response): Promise<void>;
  reject(req: Request, res: Response): Promise<void>;
  toggleBlock(req: Request, res: Response): Promise<void>;
  sendInviteToApplied(req: Request, res: Response): Promise<void>;
}
