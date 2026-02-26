import { Request, Response } from 'express';

export interface IBookingController {
  create(req: Request, res: Response): Promise<void>;
  cancel(req: Request, res: Response): Promise<void>;
  getDetails(req: Request, res: Response): Promise<void>;
  listMyBookings(req: Request, res: Response): Promise<void>;
  listAll(req: Request, res: Response): Promise<void>;
  listStylistBookings(req: Request, res: Response): Promise<void>;
  extend(req: Request, res: Response): Promise<void>;
  reschedule(req: Request, res: Response): Promise<void>;
}
