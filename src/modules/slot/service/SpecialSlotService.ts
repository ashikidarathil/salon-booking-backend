import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { ISlotRepository } from '../repository/ISlotRepository';
import { ISlotValidator } from './ISlotValidator';
import { SlotResponseDto } from '../dto/slot.response.dto';
import { ISpecialSlotService } from './ISpecialSlotService';
import { SpecialSlotStatus } from '../../../models/specialSlot.model';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { SLOT_MESSAGES } from '../constants/slot.messages';
import { toObjectId } from '../../../common/utils/mongoose.util';
import { SlotMapper, SlotLike } from '../mapper/slot.mapper';
import { resolveStylistId, timeToMinutes } from './slot.helpers';

@injectable()
export class SpecialSlotService implements ISpecialSlotService {
  constructor(
    @inject(TOKENS.SlotRepository)
    private readonly slotRepo: ISlotRepository,
    @inject(TOKENS.SlotValidator)
    private readonly slotValidator: ISlotValidator,
  ) {}

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
    const stylistId = await resolveStylistId(dto.stylistId, this.slotRepo);
    const date = new Date(dto.date);
    date.setUTCHours(0, 0, 0, 0);

    const startMin = timeToMinutes(dto.startTime);
    const endMin = timeToMinutes(dto.endTime);

    if (startMin >= endMin) {
      throw new AppError(SLOT_MESSAGES.INVALID_TIME_RANGE, HttpStatus.BAD_REQUEST);
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (date < today) {
      throw new AppError(SLOT_MESSAGES.PAST_DATE, HttpStatus.BAD_REQUEST);
    }

    const hasBookingOverlap = await this.slotValidator.checkBookingOverlap(
      stylistId,
      date,
      startMin,
      endMin,
    );
    if (hasBookingOverlap) {
      throw new AppError(SLOT_MESSAGES.UNAVAILABLE, HttpStatus.CONFLICT);
    }

    const hasSpecialOverlap = await this.slotValidator.checkSpecialSlotOverlap(
      dto.branchId,
      stylistId,
      date,
      startMin,
      endMin,
    );
    if (hasSpecialOverlap) {
      throw new AppError(SLOT_MESSAGES.SPECIAL_OVERLAP, HttpStatus.CONFLICT);
    }

    let price = 0;
    if (dto.serviceId) {
      const branchService = await this.slotRepo.findBranchService(dto.branchId, dto.serviceId);
      if (branchService) {
        price = branchService.price;
      }
    }

    const specialSlot = await this.slotRepo.createSpecialSlot({
      ...dto,
      branchId: toObjectId(dto.branchId),
      stylistId: toObjectId(stylistId),
      date,
      status: SpecialSlotStatus.AVAILABLE,
      price,
      createdBy: dto.createdBy ? toObjectId(dto.createdBy) : undefined,
      serviceId: dto.serviceId ? toObjectId(dto.serviceId) : undefined,
    });

    const populated = await this.slotRepo.findSpecialSlotById(specialSlot._id.toString());
    if (!populated) {
      throw new AppError(SLOT_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return SlotMapper.toResponse(populated as unknown as SlotLike);
  }

  async listSpecialSlots(filter: {
    branchId?: string;
    stylistId?: string;
    date?: string;
    status?: string;
  }): Promise<SlotResponseDto[]> {
    const query: Record<string, unknown> = {};
    if (filter.branchId) query.branchId = toObjectId(filter.branchId);
    if (filter.stylistId)
      query.stylistId = toObjectId(await resolveStylistId(filter.stylistId, this.slotRepo));
    if (filter.date) {
      const d = new Date(filter.date);
      d.setUTCHours(0, 0, 0, 0);
      query.date = d;
    }
    if (filter.status) {
      query.status = filter.status;
    } else {
      // Exclude CANCELLED (system-created blocked slots) — they show in the normal slot grid
      query.status = { $ne: SpecialSlotStatus.CANCELLED };
    }

    const slots = await this.slotRepo.findSpecialSlotsWithStylist(query);
    return slots.map((s) => SlotMapper.toResponse(s as unknown as SlotLike));
  }

  async cancelSpecialSlot(id: string): Promise<SlotResponseDto> {
    const slot = await this.slotRepo.findSpecialSlotById(id);
    if (!slot) {
      throw new AppError(SLOT_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (slot.status === SpecialSlotStatus.CANCELLED) {
      throw new AppError(SLOT_MESSAGES.SPECIAL_CANCELLED, HttpStatus.OK);
    }

    await this.slotRepo.updateSpecialSlot(id, { status: SpecialSlotStatus.CANCELLED });
    const updated = await this.slotRepo.findSpecialSlotById(id);
    if (!updated) {
      throw new AppError(SLOT_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return SlotMapper.toResponse(updated as unknown as SlotLike);
  }
}
