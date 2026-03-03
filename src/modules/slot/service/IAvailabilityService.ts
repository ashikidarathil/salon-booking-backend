import { SlotResponseDto } from '../dto/slot.response.dto';

export interface IAvailabilityService {
  getDynamicAvailability(
    branchId: string,
    date: Date,
    userIdOrStylistId?: string,
    duration?: number,
    includeAll?: boolean,
    serviceId?: string,
  ): Promise<SlotResponseDto[]>;
}
