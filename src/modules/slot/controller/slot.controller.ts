import { Request, Response } from 'express';
import { ISlotController } from './ISlotController';
import { ISlotService } from '../service/ISlotService';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { SLOT_MESSAGES } from '../constants/slot.messages';
import { BlockSlotDto, GetAvailableSlotsQueryDto } from '../dto/slot.request.dto';

interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
  };
}

@injectable()
export class SlotController implements ISlotController {
  constructor(
    @inject(TOKENS.SlotService)
    private readonly slotService: ISlotService,
  ) {}

  getAvailableSlots = async (req: Request, res: Response) => {
    const { branchId, date, stylistId, serviceId } =
      req.query as unknown as GetAvailableSlotsQueryDto;

    let duration: number | undefined;
    if (serviceId) {
      const { BranchServiceModel } = await import('../../../models/branchService.model');
      const branchService = await BranchServiceModel.findOne({ branchId, serviceId })
        .select('duration')
        .lean();
      if (branchService) {
        duration = branchService.duration;
      }
    }

    const slots = await this.slotService.getDynamicAvailability(
      branchId,
      new Date(date),
      stylistId,
      duration,
    );
    res.status(HttpStatus.OK).json(new ApiResponse(true, SLOT_MESSAGES.FETCHED, slots));
  };

  adminListSlots = async (req: Request, res: Response) => {
    const { branchId, date, stylistId } = req.query as unknown as GetAvailableSlotsQueryDto;
    const slots = await this.slotService.getDynamicAvailability(
      branchId,
      new Date(date),
      stylistId,
    );
    res.status(HttpStatus.OK).json(new ApiResponse(true, SLOT_MESSAGES.FETCHED, slots));
  };

  getStylistSlots = async (req: Request, res: Response) => {
    const { branchId, date } = req.query as unknown as GetAvailableSlotsQueryDto;
    const authReq = req as AuthenticatedRequest;
    const stylistId = authReq.auth?.userId;

    if (!stylistId) {
      res.status(HttpStatus.UNAUTHORIZED).json(new ApiResponse(false, SLOT_MESSAGES.UNAUTHORIZED));
      return;
    }

    const slots = await this.slotService.getDynamicAvailability(
      branchId,
      new Date(date),
      stylistId,
    );
    res.status(HttpStatus.OK).json(new ApiResponse(true, SLOT_MESSAGES.FETCHED, slots));
  };

  lockSlot = async (req: Request, res: Response) => {
    const { slotId } = req.params;
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.auth?.userId;

    if (!userId) {
      res.status(HttpStatus.UNAUTHORIZED).json(new ApiResponse(false, SLOT_MESSAGES.UNAUTHORIZED));
      return;
    }

    const slot = await this.slotService.lockSlot(slotId, userId);
    res.status(HttpStatus.OK).json(new ApiResponse(true, SLOT_MESSAGES.LOCKED, slot));
  };

  blockSlot = async (req: Request, res: Response) => {
    const { slotId } = req.params;
    const { reason }: BlockSlotDto = req.body;
    const slot = await this.slotService.blockSlot(slotId, reason);
    res.status(HttpStatus.OK).json(new ApiResponse(true, SLOT_MESSAGES.BLOCKED, slot));
  };

  unblockSlot = async (req: Request, res: Response) => {
    const { slotId } = req.params;
    const slot = await this.slotService.unblockSlot(slotId);
    res.status(HttpStatus.OK).json(new ApiResponse(true, SLOT_MESSAGES.UNBLOCKED, slot));
  };

  getDynamicAvailability = async (req: Request, res: Response) => {
    const { branchId, date, stylistId, serviceId } =
      req.query as unknown as GetAvailableSlotsQueryDto;

    let duration: number | undefined;
    if (serviceId) {
      const { BranchServiceModel } = await import('../../../models/branchService.model');
      const branchService = await BranchServiceModel.findOne({ branchId, serviceId })
        .select('duration')
        .lean();
      if (branchService) {
        duration = branchService.duration;
      }
    }

    const slots = await this.slotService.getDynamicAvailability(
      branchId,
      new Date(date),
      stylistId,
      duration,
    );
    res.status(HttpStatus.OK).json(new ApiResponse(true, SLOT_MESSAGES.FETCHED, slots));
  };
}
