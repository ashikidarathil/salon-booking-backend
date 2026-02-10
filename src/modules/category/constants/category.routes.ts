export const CATEGORY_ROUTES = {
  ADMIN: {
    CATEGORY: {
      BASE: '/admin/categories',
      PAGINATED: '/admin/categories/paginated',
      BY_ID: (id: string) => `/admin/categories/${id}`,
      SOFT_DELETE: (id: string) => `/admin/categories/${id}/delete`,
      RESTORE: (id: string) => `/admin/categories/${id}/restore`,
    },
  },

  PUBLIC: {
    CATEGORY: {
      LIST: '/categories',
    },
  },
} as const;
