import { Request, Response } from 'express';

export interface IWalletController {
  getMyWallet(req: Request, res: Response): Promise<void>;
  getTransactionHistory(req: Request, res: Response): Promise<void>;
  creditMyWallet(req: Request, res: Response): Promise<void>;
}
