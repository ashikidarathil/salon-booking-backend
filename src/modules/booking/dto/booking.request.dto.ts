export interface CreateBookingDto {
  slotId: string;
  serviceId: string;
  notes?: string;
}

export interface CancelBookingDto {
  reason?: string;
}

export interface ExtendBookingDto {
  additionalDuration: number;
}
