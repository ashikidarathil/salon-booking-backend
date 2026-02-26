import type { IBooking } from '../../../models/booking.model';
import type { BookingResponseDto } from '../dto/booking.response.dto';
import mongoose from 'mongoose';

interface PopulatedService {
  _id: mongoose.Types.ObjectId;
  name: string;
}

interface PopulatedUser {
  _id: mongoose.Types.ObjectId;
  name: string;
}

interface PopulatedStylist {
  _id: mongoose.Types.ObjectId;
  profilePicture?: string;
  userId: {
    _id: mongoose.Types.ObjectId;
    name: string;
  };
}

export class BookingMapper {
  static toResponse(booking: IBooking): BookingResponseDto {
    return {
      id: (booking._id as mongoose.Types.ObjectId).toString(),
      userId: (booking.userId as unknown as PopulatedUser)?._id?.toString() || booking.userId?.toString() || '',
      userName: (booking.userId as unknown as PopulatedUser)?.name || 'Unknown User',
      branchId: booking.branchId?.toString() || '',
      slotId: booking.slotId?.toString(),
      items: (booking.items || []).map((item) => {
        const service = item.serviceId as unknown as PopulatedService;
        const stylist = item.stylistId as unknown as PopulatedStylist;

        return {
          serviceId: service?._id?.toString() || item.serviceId?.toString() || '',
          serviceName: service?.name || 'Unknown Service',
          stylistId: stylist?._id?.toString() || item.stylistId?.toString() || '',
          stylistName: stylist?.userId?.name || 'Unknown Stylist',
          price: item.price,
          duration: item.duration,
          date:
            item.date instanceof Date ? item.date.toISOString() : new Date(item.date).toISOString(),
          startTime: item.startTime,
          endTime: item.endTime,
        };
      }),
      stylistId:
        (booking.stylistId as unknown as PopulatedStylist)?._id?.toString() ||
        booking.stylistId?.toString() ||
        '',
      stylistName:
        (booking.stylistId as unknown as PopulatedStylist)?.userId?.name || 'Unknown Stylist',
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
      cancelledAt: booking.cancelledAt ? booking.cancelledAt.toISOString() : undefined,
      extensionReason: booking.extensionReason,
      rescheduleCount: booking.rescheduleCount,
      rescheduleReason: booking.rescheduleReason,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    };
  }
}
