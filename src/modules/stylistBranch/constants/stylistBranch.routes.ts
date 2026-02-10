export const STYLIST_BRANCH_ROUTES = {
  ADMIN: {
    LIST_BRANCH_STYLISTS: '/admin/branches/:branchId/stylists',
    LIST_BRANCH_STYLISTS_PAGINATED: '/admin/branches/:branchId/stylists/paginated',
    OPTIONS_UNASSIGNED: '/admin/branches/:branchId/stylists/options',
    OPTIONS_UNASSIGNED_PAGINATED: '/admin/branches/:branchId/stylists/options/paginated',

    ASSIGN: '/admin/branches/:branchId/stylists/assign',
    UNASSIGN: '/admin/branches/:branchId/stylists/unassign',

    CHANGE_BRANCH: '/admin/branches/:branchId/stylists/change',
  },
} as const;
