import { SlotResponseDto } from '../dto/slot.response.dto';

export interface ISlotService {
  getDynamicAvailability(
    branchId: string,
    date: Date,
    userIdOrStylistId?: string,
    duration?: number,
    includeAll?: boolean,
    serviceId?: string,
  ): Promise<SlotResponseDto[]>;

  validateSlot(
    branchId: string,
    stylistId: string,
    date: Date,
    startTime: string,
    duration: number,
  ): Promise<boolean>;

  createSpecialSlot(dto: {
    stylistId: string;
    branchId: string;
    date: string;
    startTime: string;
    endTime: string;
    note?: string;
    serviceId?: string;
    createdBy?: string;
  }): Promise<SlotResponseDto>;

  listSpecialSlots(filter: {
    branchId?: string;
    stylistId?: string;
    date?: string;
    status?: string;
  }): Promise<SlotResponseDto[]>;

  cancelSpecialSlot(id: string): Promise<SlotResponseDto>;

  blockSlot(slotId: string, reason?: string): Promise<SlotResponseDto>;

  unblockSlot(slotId: string): Promise<SlotResponseDto>;
}
