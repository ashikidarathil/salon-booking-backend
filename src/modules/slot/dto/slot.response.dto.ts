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
  lockedBy: string | null;
  lockedUntil: string | null;
  stylistName?: string;
  stylistEmail?: string;
  createdAt: string;
  updatedAt: string;
}
