"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BOOKING_ROUTES = void 0;
exports.BOOKING_ROUTES = {
    USER: {
        BASE: '/bookings',
        BY_ID: (id) => `/bookings/${id}`,
        CANCEL: (id) => `/bookings/${id}/cancel`,
        RESCHEDULE: (id) => `/bookings/${id}/reschedule`,
        STATUS: (id) => `/bookings/${id}/status`,
        MY_BOOKINGS: '/bookings/my',
        APPLY_COUPON: (id) => `/bookings/${id}/apply-coupon`,
        REMOVE_COUPON: (id) => `/bookings/${id}/remove-coupon`,
    },
    ADMIN: {
        LIST: '/admin/bookings',
        TODAY: '/admin/bookings/today',
    },
    STYLIST: {
        LIST: '/stylist/bookings',
        TODAY: '/stylist/bookings/today',
        STATS: '/stylist/bookings/stats',
    },
};
