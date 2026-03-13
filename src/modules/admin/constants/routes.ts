export const API_ROUTES = {
  ADMIN: {
    USERS: {
      TOGGLE_BLOCK: (userId: string) => `/users/${userId}/block`,
      GET_USERS: '/users',
    },
    DASHBOARD: {
      STATS: '/dashboard/stats',
    },
  },
} as const;
