export const STYLIST_SERVICE_ROUTES = {
  BASE: '',
  ADMIN: {
    LIST: '/admin/stylists/:stylistId/services',
    LIST_PAGINATED: '/admin/stylists/:stylistId/services/paginated',
    TOGGLE_STATUS: '/admin/stylists/:stylistId/services/:serviceId/status',
  },
  USER: {
    STYLISTS_BY_SERVICE: '/public/services/:serviceId/stylists',
    LIST_BY_STYLIST: '/stylists/:stylistId/services',
  },
} as const;
