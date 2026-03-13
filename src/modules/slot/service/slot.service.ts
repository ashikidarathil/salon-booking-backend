import { SlotResponseDto } from '../dto/slot.response.dto';
import { ISlotService } from './ISlotService';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { ISlotRepository } from '../repository/ISlotRepository';
import { ISlotValidator } from './ISlotValidator';
import { IAvailabilityService } from './IAvailabilityService';
import { ISpecialSlotService } from './ISpecialSlotService';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { SLOT_MESSAGES } from '../constants/slot.messages';
import { SpecialSlotStatus } from '../../../models/specialSlot.model';
import { SlotMapper, SlotLike } from '../mapper/slot.mapper';
import { isValidObjectId } from '../../../common/utils/mongoose.util';

@injectable()
export class SlotService implements ISlotService {
  constructor(
    @inject(TOKENS.SlotRepository)
    private readonly slotRepo: ISlotRepository,
    @inject(TOKENS.SlotValidator)
    private readonly slotValidator: ISlotValidator,
    @inject(TOKENS.AvailabilityService)
    private readonly availabilityService: IAvailabilityService,
    @inject(TOKENS.SpecialSlotService)
    private readonly specialSlotService: ISpecialSlotService,
  ) {}

  async blockSlot(slotId: string, reason?: string): Promise<SlotResponseDto> {
    if (!isValidObjectId(slotId)) {
      throw new AppError(SLOT_MESSAGES.NOT_FOUND, HttpStatus.BAD_REQUEST);
    }
    const slot = await this.slotRepo.findSpecialSlotById(slotId);
    if (!slot) {
      throw new AppError(SLOT_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (slot.status === SpecialSlotStatus.BOOKED) {
      throw new AppError(SLOT_MESSAGES.ALREADY_BOOKED, HttpStatus.BAD_REQUEST);
    }

    await this.slotRepo.updateSpecialSlot(slotId, {
      status: SpecialSlotStatus.CANCELLED,
      note: reason,
    });
    const updated = await this.slotRepo.findSpecialSlotById(slotId);
    if (!updated) {
      throw new AppError(SLOT_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return SlotMapper.toResponse(updated as unknown as SlotLike);
  }

  async unblockSlot(slotId: string): Promise<SlotResponseDto> {
    if (!isValidObjectId(slotId)) {
      throw new AppError(SLOT_MESSAGES.NOT_FOUND, HttpStatus.BAD_REQUEST);
    }
    const slot = await this.slotRepo.findSpecialSlotById(slotId);
    if (!slot) {
      throw new AppError(SLOT_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (slot.status !== SpecialSlotStatus.CANCELLED) {
      throw new AppError(SLOT_MESSAGES.NOT_BLOCKED, HttpStatus.BAD_REQUEST);
    }

    await this.slotRepo.updateSpecialSlot(slotId, { status: SpecialSlotStatus.AVAILABLE });
    const updated = await this.slotRepo.findSpecialSlotById(slotId);
    if (!updated) {
      throw new AppError(SLOT_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return SlotMapper.toResponse(updated as unknown as SlotLike);
  }

  async getDynamicAvailability(
    branchId: string,
    date: Date,
    userIdOrStylistId?: string,
    duration?: number,
    includeAll: boolean = false,
    serviceId?: string,
  ): Promise<SlotResponseDto[]> {
    return this.availabilityService.getDynamicAvailability(
      branchId,
      date,
      userIdOrStylistId,
      duration,
      includeAll,
      serviceId,
    );
  }

  async validateSlot(
    branchId: string,
    stylistId: string,
    date: Date,
    startTime: string,
    duration: number,
  ): Promise<boolean> {
    return this.slotValidator.validateSlot(branchId, stylistId, date, startTime, duration);
  }

  async createSpecialSlot(dto: {
    stylistId: string;
    branchId: string;
    date: string;
    startTime: string;
    endTime: string;
    note?: string;
    serviceId?: string;
    createdBy?: string;
  }): Promise<SlotResponseDto> {
    return this.specialSlotService.createSpecialSlot(dto);
  }

  async listSpecialSlots(filter: {
    branchId?: string;
    stylistId?: string;
    date?: string;
    status?: string;
  }): Promise<SlotResponseDto[]> {
    return this.specialSlotService.listSpecialSlots(filter);
  }

  async cancelSpecialSlot(id: string): Promise<SlotResponseDto> {
    if (!isValidObjectId(id)) {
      throw new AppError(SLOT_MESSAGES.NOT_FOUND, HttpStatus.BAD_REQUEST);
    }
    return this.specialSlotService.cancelSpecialSlot(id);
  }
}
