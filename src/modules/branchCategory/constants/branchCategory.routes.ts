export const BRANCH_CATEGORY_ROUTES = {
  ADMIN: {
    LIST: '/admin/branches/:branchId/categories',
    LIST_PAGINATED: '/admin/branches/:branchId/categories/paginated',
    TOGGLE: '/admin/branches/:branchId/categories/:categoryId',
  },
} as const;
