export const BRANCH_ROUTES = {
  ADMIN: {
    BRANCH: {
      BASE: '/admin/branches',
      PAGINATED_LIST: '/admin/branches/paginated',
      BY_ID: (id: string) => `/admin/branches/${id}`,
      SOFT_DELETE: (id: string) => `/admin/branches/${id}/disable`,
      RESTORE: (id: string) => `/admin/branches/${id}/restore`,
    },
  },

  PUBLIC: {
    BRANCH: {
      LIST: '/branches',
      PAGINATED_LIST: '/branches/paginated',
      BY_ID: (id: string) => `/branches/${id}`,
      NEAREST: '/branches/nearest',
    },
  },
} as const;
