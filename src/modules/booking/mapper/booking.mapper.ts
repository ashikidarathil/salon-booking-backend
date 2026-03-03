import type { IBooking } from '../../../models/booking.model';
import type { BookingResponseDto } from '../dto/booking.response.dto';

interface PopulatedService {
  _id: { toString(): string };
  name: string;
}

interface PopulatedUser {
  _id: { toString(): string };
  name: string;
}

interface PopulatedStylist {
  _id: { toString(): string };
  profilePicture?: string;
  userId: {
    _id: { toString(): string };
    name: string;
  };
}

export class BookingMapper {
  static toResponse(booking: IBooking): BookingResponseDto {
    const user = booking.userId as unknown as PopulatedUser;
    const stylist = booking.stylistId as unknown as PopulatedStylist;

    return {
      id: (booking._id as { toString(): string }).toString(),
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
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      notes: booking.notes,
      cancelledBy: booking.cancelledBy,
      cancelledReason: booking.cancelledReason,
      cancelledAt: booking.cancelledAt?.toISOString(),
      extensionReason: booking.extensionReason,
      rescheduleCount: booking.rescheduleCount,
      rescheduleReason: booking.rescheduleReason,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    };
  }
}
