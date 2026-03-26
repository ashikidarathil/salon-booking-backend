import { Request, Response } from 'express';

export interface IHolidayController {
  createHoliday(req: Request, res: Response): Promise<Response>;
  getHolidays(req: Request, res: Response): Promise<Response>;
  deleteHoliday(req: Request, res: Response): Promise<Response>;
}
