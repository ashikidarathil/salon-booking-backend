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
}
