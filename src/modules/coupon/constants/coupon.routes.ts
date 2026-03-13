export const API_ROUTES = {
  ADMIN: {
    BASE: '/',
    UPDATE: '/:id',
    TOGGLE_STATUS: '/:id/toggle',
    DELETE: '/:id',
  },
  USER: {
    VALIDATE: '/validate',
    AVAILABLE: '/available',
  },
} as const;
