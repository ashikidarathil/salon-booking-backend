export const BRANCH_ROUTES = {
  ADMIN: {
    BRANCH: {
      BASE: '/admin/branches',
      BY_ID: (id: string) => `/admin/branches/${id}`,
      SOFT_DELETE: (id: string) => `/admin/branches/${id}/disable`,
      RESTORE: (id: string) => `/admin/branches/${id}/restore`,
    },
  },

  PUBLIC: {
    BRANCH: {
      LIST: '/branches',
      PAGINATED_LIST: '/admin/branches/paginated',
    },
  },
} as const;
