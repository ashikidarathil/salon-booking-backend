import { Request, Response } from 'express';

export interface IStylistWalletController {
  getStylistWallet(req: Request, res: Response): Promise<void>;
  getWalletByStylistId(req: Request, res: Response): Promise<void>;
}
