import { Request, Response } from 'express';

export interface ICouponController {
  createCoupon(req: Request, res: Response): Promise<Response>;
  updateCoupon(req: Request, res: Response): Promise<Response>;
  validateCoupon(req: Request, res: Response): Promise<Response>;
  listAvailableCoupons(req: Request, res: Response): Promise<Response>;
  listAllCoupons(req: Request, res: Response): Promise<Response>;
  toggleStatus(req: Request, res: Response): Promise<Response>;
  toggleDelete(req: Request, res: Response): Promise<Response>;
}

export interface IEscrowController {
  getAllEscrows(req: Request, res: Response): Promise<Response>;
  getEscrowByBooking(req: Request, res: Response): Promise<Response>;
  getStylistEscrows(req: Request, res: Response): Promise<Response>;
  getHeldBalance(req: Request, res: Response): Promise<Response>;
  getAdminStylistEscrows(req: Request, res: Response): Promise<Response>;
  getAdminStylistHeldBalance(req: Request, res: Response): Promise<Response>;
}
