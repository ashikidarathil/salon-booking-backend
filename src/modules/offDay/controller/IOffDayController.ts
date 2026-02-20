import { Request, Response } from 'express';

export interface IOffDayController {
  requestOffDay(req: Request, res: Response): Promise<void>;
  getMyOffDays(req: Request, res: Response): Promise<void>;
  getStylistOffDays(req: Request, res: Response): Promise<void>;
  getAllOffDays(req: Request, res: Response): Promise<void>;
  updateStatus(req: Request, res: Response): Promise<void>;
  deleteOffDay(req: Request, res: Response): Promise<void>;
}
