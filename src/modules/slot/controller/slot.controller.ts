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

  private extractAuth(req: Request, res: Response): AuthPayload | null {
    const auth = (req as AuthenticatedRequest).auth;
    if (!auth?.userId) {
      ApiResponse.error(res, SLOT_MESSAGES.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
      return null;
    }
    return auth;
  }

  // ─── Handlers ──────────────────────────────────────────────────────────────

  getAvailableSlots = async (req: Request, res: Response): Promise<Response> => {
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
    return ApiResponse.success(res, slots, SLOT_MESSAGES.FETCHED);
  };

  adminListSlots = async (req: Request, res: Response): Promise<Response> => {
    const { branchId, date, stylistId } = req.query as unknown as GetAvailableSlotsQueryDto;
    const slots = await this.slotService.getDynamicAvailability(
      branchId,
      new Date(date),
      stylistId,
      undefined,
      true,
    );
    return ApiResponse.success(res, slots, SLOT_MESSAGES.FETCHED);
  };

  getStylistSlots = async (req: Request, res: Response): Promise<Response> => {
    const auth = this.extractAuth(req, res);
    if (!auth) return res as unknown as Response; // We have already sent an error response

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
    return ApiResponse.success(res, slots, SLOT_MESSAGES.FETCHED);
  };

  blockSlot = async (req: Request, res: Response): Promise<Response> => {
    const { slotId } = req.params;
    const { reason }: BlockSlotDto = req.body;
    const slot = await this.slotService.blockSlot(slotId, reason);
    return ApiResponse.success(res, slot, SLOT_MESSAGES.BLOCKED);
  };

  unblockSlot = async (req: Request, res: Response): Promise<Response> => {
    const { slotId } = req.params;
    const slot = await this.slotService.unblockSlot(slotId);
    return ApiResponse.success(res, slot, SLOT_MESSAGES.UNBLOCKED);
  };

  getDynamicAvailability = async (req: Request, res: Response): Promise<Response> => {
    return this.getAvailableSlots(req, res);
  };

  createSpecialSlot = async (req: Request, res: Response): Promise<Response> => {
    const auth = this.extractAuth(req, res);
    if (!auth) return res as unknown as Response;

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

    return ApiResponse.success(res, slot, SLOT_MESSAGES.SPECIAL_CREATED, HttpStatus.CREATED);
  };

  listSpecialSlots = async (req: Request, res: Response): Promise<Response> => {
    const { branchId, stylistId, date, status } = req.query as unknown as ListSpecialSlotsQueryDto;
    const slots = await this.slotService.listSpecialSlots({ branchId, stylistId, date, status });
    return ApiResponse.success(res, slots, SLOT_MESSAGES.FETCHED);
  };

  cancelSpecialSlot = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const slot = await this.slotService.cancelSpecialSlot(id);
    return ApiResponse.success(res, slot, SLOT_MESSAGES.SPECIAL_CANCELLED);
  };
}
