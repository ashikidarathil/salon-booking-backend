export const STYLIST_WALLET_ROUTES = {
  STYLIST: {
    MY_WALLET: '/my-wallet',
    WITHDRAW: '/withdraw',
    WITHDRAWALS: '/withdrawals',
  },
  ADMIN: {
    ALL_WITHDRAWALS: '/admin/withdrawals',
    APPROVE: '/admin/withdrawals/:requestId/approve',
    MARK_PAID: '/admin/withdrawals/:requestId/mark-paid',
    REJECT: '/admin/withdrawals/:requestId/reject',
    STYLIST_WALLET: '/admin/stylist/:stylistId/wallet',
    STYLIST_WITHDRAWALS: '/admin/stylist/:stylistId/withdrawals',
  },
} as const;
