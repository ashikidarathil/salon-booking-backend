export const STYLIST_INVITE_ROUTES = {
  // Admin routes
  ADMIN_LIST_STYLISTS: '/admin/stylists',
  ADMIN_PAGINATED_LIST_STYLIST: '/admin/stylists/paginated',
  ADMIN_SEND_INVITE_TO_APPLIED: '/admin/stylists/:userId/send-invite',
  ADMIN_MANUAL_INVITE: '/admin/stylists/invite',
  ADMIN_APPROVE: '/admin/stylists/:userId/approve',
  ADMIN_REJECT: '/admin/stylists/:userId/reject',
  ADMIN_BLOCK: '/admin/stylists/:userId/block',
  ADMIN_BLOCK_NEW: '/admin/stylists/:stylistId/block',

  // Public routes
  PUBLIC_VALIDATE_INVITE: '/stylists/invite/:token',
  PUBLIC_ACCEPT_INVITE: '/stylists/invite/:token/accept',
} as const;
