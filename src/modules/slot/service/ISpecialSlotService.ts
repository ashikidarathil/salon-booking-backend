import { SlotResponseDto } from '../dto/slot.response.dto';

export interface ISpecialSlotService {
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
}
