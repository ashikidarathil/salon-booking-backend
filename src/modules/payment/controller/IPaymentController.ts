import { Request, Response } from 'express';

export interface IPaymentController {
  createOrder(req: Request, res: Response): Promise<void>;
  verifyPayment(req: Request, res: Response): Promise<void>;
  payWithWallet(req: Request, res: Response): Promise<void>;
  createRemainingOrder(req: Request, res: Response): Promise<void>;
  payRemainingWithWallet(req: Request, res: Response): Promise<void>;
  getPaymentById(req: Request, res: Response): Promise<void>;
}
