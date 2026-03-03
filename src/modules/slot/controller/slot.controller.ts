import { Request, Response } from 'express';
import { ISlotController } from './ISlotController';
import { ISlotService } from '../service/ISlotService';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { SLOT_MESSAGES } from '../constants/slot.messages';
import {
  BlockSlotDto,
  GetAvailableSlotsQueryDto,
  ListSpecialSlotsQueryDto,
} from '../dto/slot.request.dto';

interface AuthPayload {
  userId: string;
}

interface AuthenticatedRequest extends Request {
  auth?: AuthPayload;
}

@injectable()
export class SlotController implements ISlotController {
  constructor(
    @inject(TOKENS.SlotService)
    private readonly slotService: ISlotService,
  ) {}

  // ─── Private helper ────────────────────────────────────────────────────────

  private extractAuth(req: Request, res: Response): AuthPayload | null {
    const auth = (req as AuthenticatedRequest).auth;
    if (!auth?.userId) {
      res.status(HttpStatus.UNAUTHORIZED).json(new ApiResponse(false, SLOT_MESSAGES.UNAUTHORIZED));
      return null;
    }
    return auth;
  }

  // ─── Handlers ──────────────────────────────────────────────────────────────

  getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
    const {
      branchId,
      date,
      stylistId,
      serviceId,
      duration: queryDuration,
    } = req.query as unknown as GetAvailableSlotsQueryDto;

    const slots = await this.slotService.getDynamicAvailability(
      branchId,
      new Date(date),
      stylistId,
      queryDuration ? Number(queryDuration) : undefined,
      false,
      serviceId,
    );
    res.status(HttpStatus.OK).json(new ApiResponse(true, SLOT_MESSAGES.FETCHED, slots));
  };

  adminListSlots = async (req: Request, res: Response): Promise<void> => {
    const { branchId, date, stylistId } = req.query as unknown as GetAvailableSlotsQueryDto;
    const slots = await this.slotService.getDynamicAvailability(
      branchId,
      new Date(date),
      stylistId,
      undefined,
      true,
    );
    res.status(HttpStatus.OK).json(new ApiResponse(true, SLOT_MESSAGES.FETCHED, slots));
  };

  getStylistSlots = async (req: Request, res: Response): Promise<void> => {
    const auth = this.extractAuth(req, res);
    if (!auth) return;

    const {
      branchId,
      date,
      stylistId: queryStylistId,
    } = req.query as unknown as GetAvailableSlotsQueryDto;

    const stylistId = queryStylistId || auth.userId;

    const slots = await this.slotService.getDynamicAvailability(
      branchId,
      new Date(date),
      stylistId,
      undefined,
      true,
    );
    res.status(HttpStatus.OK).json(new ApiResponse(true, SLOT_MESSAGES.FETCHED, slots));
  };

  blockSlot = async (req: Request, res: Response): Promise<void> => {
    const { slotId } = req.params;
    const { reason }: BlockSlotDto = req.body;
    const slot = await this.slotService.blockSlot(slotId, reason);
    res.status(HttpStatus.OK).json(new ApiResponse(true, SLOT_MESSAGES.BLOCKED, slot));
  };

  unblockSlot = async (req: Request, res: Response): Promise<void> => {
    const { slotId } = req.params;
    const slot = await this.slotService.unblockSlot(slotId);
    res.status(HttpStatus.OK).json(new ApiResponse(true, SLOT_MESSAGES.UNBLOCKED, slot));
  };

  getDynamicAvailability = async (req: Request, res: Response): Promise<void> => {
    await this.getAvailableSlots(req, res);
  };

  createSpecialSlot = async (req: Request, res: Response): Promise<void> => {
    const auth = this.extractAuth(req, res);
    if (!auth) return;

    const { stylistId, branchId, date, startTime, endTime, note, serviceId } = req.body;

    const slot = await this.slotService.createSpecialSlot({
      stylistId: stylistId || auth.userId,
      branchId,
      date,
      startTime,
      endTime,
      note,
      serviceId,
      createdBy: auth.userId,
    });

    res.status(HttpStatus.CREATED).json(new ApiResponse(true, SLOT_MESSAGES.SPECIAL_CREATED, slot));
  };

  listSpecialSlots = async (req: Request, res: Response): Promise<void> => {
    const { branchId, stylistId, date, status } = req.query as unknown as ListSpecialSlotsQueryDto;
    const slots = await this.slotService.listSpecialSlots({ branchId, stylistId, date, status });
    res.status(HttpStatus.OK).json(new ApiResponse(true, SLOT_MESSAGES.FETCHED, slots));
  };

  cancelSpecialSlot = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const slot = await this.slotService.cancelSpecialSlot(id);
    res.status(HttpStatus.OK).json(new ApiResponse(true, SLOT_MESSAGES.SPECIAL_CANCELLED, slot));
  };
}
