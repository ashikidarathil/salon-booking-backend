import { SlotStatus } from '../constants/slot.constants';

export interface SlotResponseDto {
  id: string;
  branchId: string;
  stylistId: string;
  date: string;
  startTime: string;
  endTime: string;
  startTimeUTC: string;
  status: SlotStatus;
  stylistName?: string;
  stylistEmail?: string;
  lockedBy?: string | null;
  lockedUntil?: string | null;
  note?: string;
  price?: number;
  bookedServices?: string[];
  createdAt: string;
  updatedAt: string;
}
