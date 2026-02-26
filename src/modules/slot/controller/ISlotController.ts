import { Request, Response } from 'express';

export interface ISlotController {
  getAvailableSlots(req: Request, res: Response): Promise<void>;
  adminListSlots(req: Request, res: Response): Promise<void>;
  getStylistSlots(req: Request, res: Response): Promise<void>;
  blockSlot(req: Request, res: Response): Promise<void>;
  unblockSlot(req: Request, res: Response): Promise<void>;
  getDynamicAvailability(req: Request, res: Response): Promise<void>;
  createSpecialSlot(req: Request, res: Response): Promise<void>;
  listSpecialSlots(req: Request, res: Response): Promise<void>;
  cancelSpecialSlot(req: Request, res: Response): Promise<void>;
}
