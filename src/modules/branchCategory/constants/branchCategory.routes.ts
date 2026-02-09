export const BRANCH_CATEGORY_ROUTES = {
  ADMIN: {
    LIST: '/admin/branches/:branchId/categories',
    TOGGLE: '/admin/branches/:branchId/categories/:categoryId',
  },
} as const;
