export const BOOKING_ROUTES = {
  USER: {
    BASE: '/bookings',
    BY_ID: (id: string) => `/bookings/${id}`,
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
    RESCHEDULE: (id: string) => `/bookings/${id}/reschedule`,
    STATUS: (id: string) => `/bookings/${id}/status`,
    MY_BOOKINGS: '/bookings/my',
    APPLY_COUPON: (id: string) => `/bookings/${id}/apply-coupon`,
    REMOVE_COUPON: (id: string) => `/bookings/${id}/remove-coupon`,
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
