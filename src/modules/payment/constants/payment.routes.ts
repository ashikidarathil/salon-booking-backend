export const API_ROUTES = {
  ADMIN: {
    BASE: '/',
    BY_ID: (id: string) => `/${id}`,
  },
  USER: {
    CREATE_ORDER: '/create-order',
    VERIFY: '/verify',
    PAY_WITH_WALLET: '/pay-with-wallet',
    PAY_REMAINING_ORDER: '/create-remaining-order',
    PAY_REMAINING_WALLET: '/pay-remaining-with-wallet',
  },
} as const;
