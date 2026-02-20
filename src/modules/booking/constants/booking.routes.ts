export const BOOKING_ROUTES = {
  USER: {
    BASE: '/bookings',
    BY_ID: (id: string) => `/bookings/${id}`,
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
    EXTEND: (id: string) => `/bookings/${id}/extend`,
    MY_BOOKINGS: '/bookings/me',
  },
  ADMIN: {
    LIST: '/admin/bookings',
  },
};
