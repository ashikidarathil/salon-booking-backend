"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscrowMapper = void 0;
class EscrowMapper {
    static toResponseDto(escrow) {
        const booking = escrow.bookingId;
        const stylist = escrow.stylistId;
        const isBookingPopulated = !!(booking &&
            typeof booking === 'object' &&
            ('bookingNumber' in booking ||
                'items' in booking));
        const isStylistPopulated = !!(stylist &&
            typeof stylist === 'object' &&
            'userId' in stylist);
        const bookingObj = isBookingPopulated ? booking : null;
        const stylistObj = isStylistPopulated ? stylist : null;
        const bookingNumber = bookingObj && bookingObj.bookingNumber
            ? bookingObj.bookingNumber
            : bookingObj?._id
                ? `BK-${bookingObj._id.toString().slice(-6).toUpperCase()}`
                : 'N/A';
        return {
            id: escrow._id?.toString() ?? '',
            bookingId: {
                id: isBookingPopulated && bookingObj
                    ? bookingObj._id.toString()
                    : (escrow.bookingId?.toString() ?? ''),
                bookingNumber: bookingNumber,
                userId: isBookingPopulated && bookingObj && bookingObj.userId
                    ? {
                        name: bookingObj.userId.name,
                    }
                    : undefined,
                items: isBookingPopulated && bookingObj && bookingObj.items
                    ? bookingObj.items.map((item) => ({
                        serviceId: {
                            name: item.serviceId && typeof item.serviceId === 'object' && 'name' in item.serviceId
                                ? item.serviceId.name
                                : 'Service',
                        },
                    }))
                    : [],
            },
            stylistId: {
                id: isStylistPopulated && stylistObj
                    ? stylistObj._id.toString()
                    : (escrow.stylistId?.toString() ?? ''),
                userId: {
                    name: isStylistPopulated && stylistObj && stylistObj.userId
                        ? (stylistObj.userId.name ?? 'Stylist')
                        : 'Stylist',
                },
            },
            amount: escrow.amount,
            status: escrow.status,
            releaseDate: escrow.releaseDate,
            createdAt: escrow.createdAt?.toISOString() ?? '',
        };
    }
    static toResponseListDto(escrows) {
        return escrows.map((e) => this.toResponseDto(e));
    }
}
exports.EscrowMapper = EscrowMapper;
