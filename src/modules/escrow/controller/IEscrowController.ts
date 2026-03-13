import { Request, Response } from 'express';

export interface IEscrowController {
  getAllEscrows(req: Request, res: Response): Promise<void>;
  getEscrowByBooking(req: Request, res: Response): Promise<void>;
  getStylistEscrows(req: Request, res: Response): Promise<void>;
  getHeldBalance(req: Request, res: Response): Promise<void>;
  getAdminStylistEscrows(req: Request, res: Response): Promise<void>;
  getAdminStylistHeldBalance(req: Request, res: Response): Promise<void>;
}
