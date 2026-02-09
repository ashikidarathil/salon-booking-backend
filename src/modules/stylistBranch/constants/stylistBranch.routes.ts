export const STYLIST_BRANCH_ROUTES = {
  ADMIN: {
    LIST_BRANCH_STYLISTS: '/admin/branches/:branchId/stylists',
    OPTIONS_UNASSIGNED: '/admin/branches/:branchId/stylists/options',

    ASSIGN: '/admin/branches/:branchId/stylists/assign',
    UNASSIGN: '/admin/branches/:branchId/stylists/unassign',

    CHANGE_BRANCH: '/admin/branches/:branchId/stylists/change',
  },
} as const;
