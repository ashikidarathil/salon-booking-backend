import { Router } from 'express';
import { resolveSlotController } from '../index';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { SLOT_ROUTES } from '../constants/slot.routes';

const router = Router();
const controller = resolveSlotController();

// USER ROUTES
router.get(SLOT_ROUTES.USER.LIST, controller.getAvailableSlots.bind(controller));

router.get(SLOT_ROUTES.USER.AVAILABILITY, controller.getDynamicAvailability.bind(controller));

// ADMIN ROUTES
router.get(
  SLOT_ROUTES.ADMIN.LIST,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.adminListSlots.bind(controller),
);

router.patch(
  SLOT_ROUTES.ADMIN.BLOCK,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN, UserRole.STYLIST]),
  controller.blockSlot.bind(controller),
);

router.patch(
  SLOT_ROUTES.ADMIN.UNBLOCK,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN, UserRole.STYLIST]),
  controller.unblockSlot.bind(controller),
);

// STYLIST ROUTES
router.get(
  SLOT_ROUTES.STYLIST.LIST,
  authMiddleware,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN]),
  controller.getStylistSlots.bind(controller),
);

// Special Slot — Stylist or Admin creates a parallel slot
router.post(
  SLOT_ROUTES.ADMIN.CREATE_SPECIAL,
  authMiddleware,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN]),
  controller.createSpecialSlot.bind(controller),
);

router.get(
  SLOT_ROUTES.ADMIN.LIST_SPECIAL,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN, UserRole.STYLIST]),
  controller.listSpecialSlots.bind(controller),
);

router.delete(
  SLOT_ROUTES.ADMIN.CANCEL_SPECIAL,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN, UserRole.STYLIST]),
  controller.cancelSpecialSlot.bind(controller),
);

export default router;
