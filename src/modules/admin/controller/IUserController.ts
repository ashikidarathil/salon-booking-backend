import { Request, Response } from 'express';

export interface IUserController {
  toggleBlock(req: Request, res: Response): Promise<Response>;
  getUsers(req: Request, res: Response): Promise<Response>;
}

export interface IBookingController {
  create(req: Request, res: Response): Promise<Response>;
  cancel(req: Request, res: Response): Promise<Response>;
  getDetails(req: Request, res: Response): Promise<Response>;
  listMyBookings(req: Request, res: Response): Promise<Response>;
  listAll(req: Request, res: Response): Promise<Response>;
  listStylistBookings(req: Request, res: Response): Promise<Response>;
  reschedule(req: Request, res: Response): Promise<Response>;
  updateStatus(req: Request, res: Response): Promise<Response>;
  getTodayBookings(req: Request, res: Response): Promise<Response>;
  getStylistTodayBookings(req: Request, res: Response): Promise<Response>;
  getStylistStats(req: Request, res: Response): Promise<Response>;
  applyCoupon(req: Request, res: Response): Promise<Response>;
  removeCoupon(req: Request, res: Response): Promise<Response>;
}
