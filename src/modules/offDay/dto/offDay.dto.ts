import { OffDayType, OffDayStatus } from '../../../models/stylistOffDay.model';

export interface OffDayRequestDto {
  stylistId: string;
  branchId: string;
  type: OffDayType;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface OffDayResponseDto {
  id: string;
  stylistId: string;
  type: OffDayType;
  startDate: string;
  endDate: string;
  reason?: string;
  status: OffDayStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OffDayActionDto {
  status: OffDayStatus.APPROVED | OffDayStatus.REJECTED;
  rejectionReason?: string;
}
