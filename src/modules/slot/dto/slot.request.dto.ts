export interface GenerateSlotsDto {
  branchId: string;
  startDate: string; // ISO Date string
  endDate: string; // ISO Date string
  stylistId?: string;
}

export interface BlockSlotDto {
  reason?: string;
}

export interface GetAvailableSlotsQueryDto {
  branchId: string;
  date: string; // ISO Date string
  stylistId?: string;
  serviceId?: string;
  duration?: number;
}
export interface ListSpecialSlotsQueryDto {
  branchId?: string;
  stylistId?: string;
  date?: string;
  status?: string;
}

export interface CreateSpecialSlotDto {
  stylistId: string;
  branchId: string;
  date: string;
  startTime: string;
  endTime: string;
  note?: string;
  serviceId?: string;
}
