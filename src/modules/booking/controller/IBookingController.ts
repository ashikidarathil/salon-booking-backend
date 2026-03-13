import { Request, Response } from 'express';

export interface IBookingController {
  create(req: Request, res: Response): Promise<void>;
  cancel(req: Request, res: Response): Promise<void>;
  getDetails(req: Request, res: Response): Promise<void>;
  listMyBookings(req: Request, res: Response): Promise<void>;
  listAll(req: Request, res: Response): Promise<void>;
  listStylistBookings(req: Request, res: Response): Promise<void>;
  reschedule(req: Request, res: Response): Promise<void>;
  updateStatus(req: Request, res: Response): Promise<void>;
  getTodayBookings(req: Request, res: Response): Promise<void>;
  getStylistTodayBookings(req: Request, res: Response): Promise<void>;
  getStylistStats(req: Request, res: Response): Promise<void>;
  applyCoupon(req: Request, res: Response): Promise<void>;
  removeCoupon(req: Request, res: Response): Promise<void>;
}
