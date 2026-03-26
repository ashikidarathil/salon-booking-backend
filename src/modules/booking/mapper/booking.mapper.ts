import type {
  BookingEntity,
  BookingRef,
  BookingItemEntity,
  PopulatedUserRef,
  PopulatedStylistRef,
  PopulatedServiceRef,
} from '../../../common/types/bookingEntity';
import type { BookingResponseDto } from '../dto/booking.response.dto';

export class BookingMapper {
  static toResponse(booking: BookingEntity): BookingResponseDto {
    const isPopulated = (
      ref: BookingRef | PopulatedUserRef | PopulatedStylistRef | PopulatedServiceRef,
    ): ref is { _id: string | { toString(): string } } =>
      !!ref && typeof ref === 'object' && '_id' in ref;

    const userId = isPopulated(booking.userId) ? booking.userId._id.toString() : booking.userId;
    const userName = isPopulated(booking.userId)
      ? (booking.userId as PopulatedUserRef).name
      : 'Unknown User';

    const stylist = booking.stylistId;
    const stylistIdStr = isPopulated(stylist) ? stylist._id.toString() : (stylist as string);
    const stylistName = isPopulated(stylist)
      ? (stylist as PopulatedStylistRef).userId?.name
      : 'Unknown Stylist';

    return {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      userId: userId,
      userName: userName,
      branchId: booking.branchId,
      slotId: booking.slotId,
      items: (booking.items ?? []).map((item: BookingItemEntity) => {
        const service = item.serviceId;
        const itemStylist = item.stylistId;

        return {
          serviceId: isPopulated(service) ? service._id.toString() : (service as string),
          serviceName: isPopulated(service)
            ? (service as PopulatedServiceRef).name
            : 'Unknown Service',
          serviceImageUrl: isPopulated(service)
            ? (service as PopulatedServiceRef).imageUrl
            : undefined,
          stylistId: isPopulated(itemStylist)
            ? itemStylist._id.toString()
            : (itemStylist as string),
          stylistName: isPopulated(itemStylist)
            ? (itemStylist as PopulatedStylistRef).userId?.name
            : 'Unknown Stylist',
          price: item.price,
          duration: item.duration,
          date: item.date.toISOString(),
          startTime: item.startTime,
          endTime: item.endTime,
        };
      }),
      stylistId: stylistIdStr,
      stylistName: stylistName || 'Unknown Stylist',
      date: booking.date.toISOString(),
      startTime: booking.startTime,
      endTime: booking.endTime,
      totalPrice: booking.totalPrice,
      discountAmount: booking.discountAmount || 0,
      payableAmount: booking.payableAmount,
      advanceAmount: booking.advanceAmount,
      couponId:
        booking.couponId && typeof booking.couponId === 'object'
          ? booking.couponId.toString()
          : (booking.couponId as string),
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

  static toResponseList(bookings: BookingEntity[]): BookingResponseDto[] {
    return bookings.map((booking) => this.toResponse(booking));
  }
}
