export const SLOT_ROUTES = {
  ADMIN: {
    LIST: '/slots/admin',
    BLOCK: '/slots/:slotId/block',
    UNBLOCK: '/slots/:slotId/unblock',
  },
  USER: {
    LIST: '/slots',
    AVAILABILITY: '/availability',
    LOCK: '/slots/:slotId/lock',
  },
  STYLIST: {
    LIST: '/slots/stylist',
    BLOCK: '/slots/:slotId/block',
    UNBLOCK: '/slots/:slotId/unblock',
  },
};
