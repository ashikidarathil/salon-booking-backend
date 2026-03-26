import { Request, Response } from 'express';

export interface ISlotController {
  getAvailableSlots(req: Request, res: Response): Promise<Response>;
  adminListSlots(req: Request, res: Response): Promise<Response>;
  getStylistSlots(req: Request, res: Response): Promise<Response>;
  blockSlot(req: Request, res: Response): Promise<Response>;
  unblockSlot(req: Request, res: Response): Promise<Response>;
  getDynamicAvailability(req: Request, res: Response): Promise<Response>;
  createSpecialSlot(req: Request, res: Response): Promise<Response>;
  listSpecialSlots(req: Request, res: Response): Promise<Response>;
  cancelSpecialSlot(req: Request, res: Response): Promise<Response>;
}
