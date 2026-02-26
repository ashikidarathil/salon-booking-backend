export const SLOT_ROUTES = {
  ADMIN: {
    LIST: '/slots/admin',
    BLOCK: '/slots/:slotId/block',
    UNBLOCK: '/slots/:slotId/unblock',
    CREATE_SPECIAL: '/slots/special',
    LIST_SPECIAL: '/slots/special/list',
    CANCEL_SPECIAL: '/slots/special/:id',
  },
  USER: {
    LIST: '/slots',
    AVAILABILITY: '/availability',
  },
  STYLIST: {
    LIST: '/slots/stylist',
    BLOCK: '/slots/:slotId/block',
    UNBLOCK: '/slots/:slotId/unblock',
    LIST_SPECIAL: '/slots/special/list',
    CANCEL_SPECIAL: '/slots/special/:id',
  },
};
