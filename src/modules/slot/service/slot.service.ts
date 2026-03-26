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
import { isValidObjectId, toObjectId } from '../../../common/utils/mongoose.util';

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
    // Dynamic slot IDs are generated on the fly and not in the DB.
    // Format: dynamic_{branchId}_{stylistId}_{date}_{startTime}_{endTime}
    if (slotId.startsWith('dynamic_')) {
      const parts = slotId.split('_');
      // parts[0] = 'dynamic', [1] = branchId, [2] = stylistId, [3] = date, [4] = startTime, [5] = endTime
      if (parts.length < 6) {
        throw new AppError(SLOT_MESSAGES.NOT_FOUND, HttpStatus.BAD_REQUEST);
      }
      const [, branchId, stylistId, date, startTime, endTime] = parts;

      // Check stylist exists
      const stylist = await this.slotRepo.findStylistById(stylistId);
      if (!stylist) {
        throw new AppError(SLOT_MESSAGES.NOT_FOUND, HttpStatus.BAD_REQUEST);
      }

      // Create a blocked special slot record directly
      const created = await this.slotRepo.createSpecialSlot({
        branchId: toObjectId(branchId),
        stylistId: stylist._id,
        date: new Date(date),
        startTime,
        endTime,
        status: SpecialSlotStatus.CANCELLED,
        note: reason,
      });
      return SlotMapper.toResponse(created as unknown as SlotLike);
    }

    // Real/persisted slot — original flow
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
    // Handle dynamic slot IDs — find and delete the matching CANCELLED special slot
    if (slotId.startsWith('dynamic_')) {
      const parts = slotId.split('_');
      if (parts.length < 6) {
        throw new AppError(SLOT_MESSAGES.NOT_FOUND, HttpStatus.BAD_REQUEST);
      }
      const [, branchId, stylistId, date, startTime, endTime] = parts;

      // Find the CANCELLED special slot created when this dynamic slot was blocked
      const allCancelled = await this.slotRepo.findSpecialSlots(
        branchId,
        [stylistId],
        new Date(date),
      );
      const blocked = allCancelled.find(
        (ss) =>
          ss.status === SpecialSlotStatus.CANCELLED &&
          ss.startTime === startTime &&
          ss.endTime === endTime,
      );

      if (!blocked) {
        throw new AppError(SLOT_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      // Delete the CANCELLED special slot record — restores dynamic slot to AVAILABLE
      await this.slotRepo.updateSpecialSlot(blocked._id.toString(), {
        status: SpecialSlotStatus.AVAILABLE,
        note: undefined,
      });
      const updated = await this.slotRepo.findSpecialSlotById(blocked._id.toString());
      return SlotMapper.toResponse((updated ?? blocked) as unknown as SlotLike);
    }

    // Real/persisted slot — original flow
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
