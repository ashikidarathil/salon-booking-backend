import { Request, Response } from 'express';

export interface IPaymentController {
  createOrder(req: Request, res: Response): Promise<Response>;
  verifyPayment(req: Request, res: Response): Promise<Response>;
  payWithWallet(req: Request, res: Response): Promise<Response>;
  createRemainingOrder(req: Request, res: Response): Promise<Response>;
  payRemainingWithWallet(req: Request, res: Response): Promise<Response>;
  getPaymentById(req: Request, res: Response): Promise<Response>;
}
