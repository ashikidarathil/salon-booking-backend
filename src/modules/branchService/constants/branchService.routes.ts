export const BRANCH_SERVICE_ROUTES = {
  ADMIN: {
    LIST: '/admin/branches/:branchId/services',
    UPSERT: '/admin/branches/:branchId/services/:serviceId',
    TOGGLE_STATUS: '/admin/branches/:branchId/services/:serviceId/status',
  },
} as const;
