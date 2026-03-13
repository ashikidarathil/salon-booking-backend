import type { IBooking } from '../../../models/booking.model';
import type { 
  BookingResponseDto, 
  PopulatedUser, 
  PopulatedStylist, 
  PopulatedService 
} from '../dto/booking.response.dto';

export class BookingMapper {
  static toResponse(booking: IBooking): BookingResponseDto {
    const user = booking.userId as unknown as PopulatedUser;
    const stylist = booking.stylistId as unknown as PopulatedStylist;

    return {
      id: (booking._id as { toString(): string }).toString(),
      bookingNumber: booking.bookingNumber || `BK-${(booking._id as { toString(): string }).toString().slice(-6).toUpperCase()}`,
      userId: user?._id?.toString() ?? booking.userId?.toString() ?? '',
      userName: user?.name ?? 'Unknown User',
      branchId: booking.branchId?.toString() ?? '',
      slotId: booking.slotId?.toString(),
      items: (booking.items ?? []).map((item) => {
        const service = item.serviceId as unknown as PopulatedService;
        const itemStylist = item.stylistId as unknown as PopulatedStylist;

        return {
          serviceId: service?._id?.toString() ?? item.serviceId?.toString() ?? '',
          serviceName: service?.name ?? 'Unknown Service',
          serviceImageUrl: service?.imageUrl,
          stylistId: itemStylist?._id?.toString() ?? item.stylistId?.toString() ?? '',
          stylistName: itemStylist?.userId?.name ?? 'Unknown Stylist',
          price: item.price,
          duration: item.duration,
          date:
            item.date instanceof Date ? item.date.toISOString() : new Date(item.date).toISOString(),
          startTime: item.startTime,
          endTime: item.endTime,
        };
      }),
      stylistId: stylist?._id?.toString() ?? booking.stylistId?.toString() ?? '',
      stylistName: stylist?.userId?.name ?? 'Unknown Stylist',
      date:
        booking.date instanceof Date
          ? booking.date.toISOString()
          : new Date(booking.date).toISOString(),
      startTime: booking.startTime,
      endTime: booking.endTime,
      totalPrice: booking.totalPrice,
      discountAmount: booking.discountAmount || 0,
      payableAmount: booking.payableAmount,
      advanceAmount: booking.advanceAmount,
      couponId: booking.couponId?.toString(),
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      notes: booking.notes,
      cancelledBy: booking.cancelledBy,
      cancelledReason: booking.cancelledReason,
      cancelledAt: booking.cancelledAt?.toISOString(),
      rescheduleCount: booking.rescheduleCount,
      rescheduleReason: booking.rescheduleReason,
      paymentWindowExpiresAt: booking.paymentWindowExpiresAt?.toISOString(),
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    };
  }

  static toResponseList(bookings: IBooking[]): BookingResponseDto[] {
    return bookings.map(booking => this.toResponse(booking));
  }
}
