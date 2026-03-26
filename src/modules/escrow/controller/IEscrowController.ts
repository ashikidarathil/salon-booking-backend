import { Request, Response } from 'express';

export interface IEscrowController {
  getAllEscrows(req: Request, res: Response): Promise<Response>;
  getEscrowByBooking(req: Request, res: Response): Promise<Response>;
  getStylistEscrows(req: Request, res: Response): Promise<Response>;
  getHeldBalance(req: Request, res: Response): Promise<Response>;
  getAdminStylistEscrows(req: Request, res: Response): Promise<Response>;
  getAdminStylistHeldBalance(req: Request, res: Response): Promise<Response>;
}
