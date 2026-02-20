import { SlotResponseDto } from '../dto/slot.response.dto';

export interface ISlotService {
  lockSlot(slotId: string, userId: string): Promise<SlotResponseDto>;
  blockSlot(slotId: string, reason?: string): Promise<SlotResponseDto>;
  unblockSlot(slotId: string): Promise<SlotResponseDto>;
  getDynamicAvailability(
    branchId: string,
    date: Date,
    userIdOrStylistId?: string,
    duration?: number,
  ): Promise<SlotResponseDto[]>;
  validateSlot(
    branchId: string,
    stylistId: string,
    date: Date,
    startTime: string,
    duration: number,
  ): Promise<boolean>;
}
