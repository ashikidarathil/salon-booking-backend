import { Request, Response } from 'express';

export interface IScheduleController {
  updateWeekly(req: Request, res: Response): Promise<void>;
  getWeekly(req: Request, res: Response): Promise<void>;
  createDailyOverride(req: Request, res: Response): Promise<void>;
  deleteDailyOverride(req: Request, res: Response): Promise<void>;
  getDailyOverrides(req: Request, res: Response): Promise<void>;
  addBreak(req: Request, res: Response): Promise<void>;
  deleteBreak(req: Request, res: Response): Promise<void>;
  getBreaks(req: Request, res: Response): Promise<void>;
}
