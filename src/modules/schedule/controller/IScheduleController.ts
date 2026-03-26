import { Request, Response } from 'express';

export interface IScheduleController {
  updateWeekly(req: Request, res: Response): Promise<Response>;
  getWeekly(req: Request, res: Response): Promise<Response>;
  createDailyOverride(req: Request, res: Response): Promise<Response>;
  deleteDailyOverride(req: Request, res: Response): Promise<Response>;
  getDailyOverrides(req: Request, res: Response): Promise<Response>;
  addBreak(req: Request, res: Response): Promise<Response>;
  deleteBreak(req: Request, res: Response): Promise<Response>;
  getBreaks(req: Request, res: Response): Promise<Response>;
}
