import type { IBooking } from '../../../models/booking.model';
import type { BookingResponseDto } from '../dto/booking.response.dto';

export class BookingMapper {
  static toResponse(booking: IBooking): BookingResponseDto {
    return {
      id: booking._id.toString(),
      userId: booking.userId.toString(),
      branchId: booking.branchId.toString(),
      slotId: booking.slotId ? booking.slotId.toString() : undefined,
      serviceId: booking.serviceId.toString(),
      stylistId: booking.stylistId.toString(),
      date: booking.date.toISOString(),
      startTime: booking.startTime,
      endTime: booking.endTime,
      totalPrice: booking.totalPrice,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      notes: booking.notes,
      cancelledBy: booking.cancelledBy,
      cancelledReason: booking.cancelledReason,
      cancelledAt: booking.cancelledAt ? booking.cancelledAt.toISOString() : undefined,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    };
  }
}
