import { Request, Response } from 'express';

export interface IOffDayController {
  requestOffDay(req: Request, res: Response): Promise<Response>;
  getMyOffDays(req: Request, res: Response): Promise<Response>;
  getStylistOffDays(req: Request, res: Response): Promise<Response>;
  getAllOffDays(req: Request, res: Response): Promise<Response>;
  updateStatus(req: Request, res: Response): Promise<Response>;
  deleteOffDay(req: Request, res: Response): Promise<Response>;
}
