import { Request, Response } from 'express';

export interface IHolidayController {
  createHoliday(req: Request, res: Response): Promise<void>;
  getHolidays(req: Request, res: Response): Promise<void>;
  deleteHoliday(req: Request, res: Response): Promise<void>;
}
