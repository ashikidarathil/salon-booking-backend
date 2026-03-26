import { Request, Response } from 'express';

export interface IWalletController {
  getMyWallet(req: Request, res: Response): Promise<Response>;
  getTransactionHistory(req: Request, res: Response): Promise<Response>;
  creditMyWallet(req: Request, res: Response): Promise<Response>;
  createTopupOrder(req: Request, res: Response): Promise<Response>;
  verifyTopup(req: Request, res: Response): Promise<Response>;
}
