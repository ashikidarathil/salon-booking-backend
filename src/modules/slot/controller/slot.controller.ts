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

  adminListSlots = async (req: Request, res: Response) => {
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

  getStylistSlots = async (req: Request, res: Response) => {
    const {
      branchId,
      date,
      stylistId: queryStylistId,
    } = req.query as unknown as GetAvailableSlotsQueryDto;
    const authReq = req as AuthenticatedRequest;
    const stylistId = queryStylistId || authReq.auth?.userId;

    if (!stylistId) {
      res.status(HttpStatus.UNAUTHORIZED).json(new ApiResponse(false, SLOT_MESSAGES.UNAUTHORIZED));
      return;
    }

    const slots = await this.slotService.getDynamicAvailability(
      branchId,
      new Date(date),
      stylistId,
      undefined,
      true,
    );
    res.status(HttpStatus.OK).json(new ApiResponse(true, SLOT_MESSAGES.FETCHED, slots));
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
    await this.getAvailableSlots(req, res);
  };

  createSpecialSlot = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const { stylistId, branchId, date, startTime, endTime, note } = req.body;

    // If caller is a STYLIST, use their own userId as stylistId if not provided
    const resolvedStylistId = stylistId || authReq.auth?.userId;

    if (!resolvedStylistId || !branchId || !date || !startTime || !endTime) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json(
          new ApiResponse(
            false,
            'Missing required fields: stylistId, branchId, date, startTime, endTime',
          ),
        );
      return;
    }

    const slot = await this.slotService.createSpecialSlot({
      stylistId: resolvedStylistId,
      branchId,
      date,
      startTime,
      endTime,
      note,
      serviceId: req.body.serviceId,
      createdBy: authReq.auth?.userId,
    });

    res.status(HttpStatus.CREATED).json(new ApiResponse(true, SLOT_MESSAGES.SPECIAL_CREATED, slot));
  };

  listSpecialSlots = async (req: Request, res: Response) => {
    const { branchId, stylistId, date, status } = req.query as unknown as ListSpecialSlotsQueryDto;
    const slots = await this.slotService.listSpecialSlots({ branchId, stylistId, date, status });
    res.status(HttpStatus.OK).json(new ApiResponse(true, SLOT_MESSAGES.FETCHED, slots));
  };

  cancelSpecialSlot = async (req: Request, res: Response) => {
    const { id } = req.params;
    const slot = await this.slotService.cancelSpecialSlot(id);
    res.status(HttpStatus.OK).json(new ApiResponse(true, SLOT_MESSAGES.SPECIAL_CANCELLED, slot));
  };
}
