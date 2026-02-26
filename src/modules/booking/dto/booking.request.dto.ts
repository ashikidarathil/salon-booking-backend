export interface BookingItemInput {
  serviceId: string;
  stylistId: string;
  date: string;
  startTime: string;
  slotId: string;
}

export interface CreateBookingDto {
  slotId?: string;
  items: BookingItemInput[];
  notes?: string;
}

export interface CancelBookingDto {
  reason?: string;
}

export interface ExtendBookingDto {
  additionalDuration?: number;
  reason: string;
  newService?: BookingItemInput;
}

export interface RescheduleBookingDto {
  items: BookingItemInput[];
  reason?: string;
}

export interface UpdateBookingStatusDto {
  status: string;
}
