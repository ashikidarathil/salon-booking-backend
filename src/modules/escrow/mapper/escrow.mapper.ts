import { IEscrow } from '../../../models/escrow.model';
import { EscrowResponseDto } from '../dto/escrow.response.dto';
import { EscrowStatus } from '../constants/escrow.constants';
import { IBooking } from '../../../models/booking.model';
import { IStylist } from '../../../models/stylist.model';

interface PopulatedBooking extends Omit<IBooking, 'userId' | 'items'> {
  userId?: { name: string };
  items?: Array<{
    serviceId: { name: string };
  }>;
}

interface PopulatedStylist extends Omit<IStylist, 'userId'> {
  userId: { name: string };
}

export class EscrowMapper {
  static toResponseDto(escrow: IEscrow): EscrowResponseDto {
    const booking = escrow.bookingId;
    const stylist = escrow.stylistId;

    const isBookingPopulated = !!(
      booking &&
      typeof booking === 'object' &&
      ('bookingNumber' in (booking as unknown as Record<string, unknown>) ||
        'items' in (booking as unknown as Record<string, unknown>))
    );
    const isStylistPopulated = !!(
      stylist &&
      typeof stylist === 'object' &&
      'userId' in (stylist as unknown as Record<string, unknown>)
    );

    const bookingObj = isBookingPopulated ? (booking as unknown as PopulatedBooking) : null;
    const stylistObj = isStylistPopulated ? (stylist as unknown as PopulatedStylist) : null;

    const bookingNumber =
      bookingObj && bookingObj.bookingNumber
        ? bookingObj.bookingNumber
        : bookingObj?._id
          ? `BK-${bookingObj._id.toString().slice(-6).toUpperCase()}`
          : 'N/A';

    return {
      id: escrow._id?.toString() ?? '',
      bookingId: {
        id:
          isBookingPopulated && bookingObj
            ? bookingObj._id.toString()
            : (escrow.bookingId?.toString() ?? ''),
        bookingNumber: bookingNumber,
        userId:
          isBookingPopulated && bookingObj && bookingObj.userId
            ? {
                name: bookingObj.userId.name,
              }
            : undefined,
        items:
          isBookingPopulated && bookingObj && bookingObj.items
            ? bookingObj.items.map((item) => ({
                serviceId: {
                  name:
                    item.serviceId && typeof item.serviceId === 'object' && 'name' in item.serviceId
                      ? (item.serviceId as { name: string }).name
                      : 'Service',
                },
              }))
            : [],
      },
      stylistId: {
        id:
          isStylistPopulated && stylistObj
            ? stylistObj._id.toString()
            : (escrow.stylistId?.toString() ?? ''),
        userId: {
          name:
            isStylistPopulated && stylistObj && stylistObj.userId
              ? (stylistObj.userId.name ?? 'Stylist')
              : 'Stylist',
        },
      },
      amount: escrow.amount,
      status: escrow.status as EscrowStatus,
      releaseDate: escrow.releaseDate,
      createdAt: escrow.createdAt?.toISOString() ?? '',
    };
  }

  static toResponseListDto(escrows: IEscrow[]): EscrowResponseDto[] {
    return escrows.map((e) => this.toResponseDto(e));
  }
}
