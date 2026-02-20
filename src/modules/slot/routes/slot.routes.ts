import { Router } from 'express';
import { resolveSlotController } from '../index';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { SLOT_ROUTES } from '../constants/slot.routes';

const router = Router();
const controller = resolveSlotController();

// USER ROUTES
router.get(
  SLOT_ROUTES.USER.LIST,
  authMiddleware,
  roleMiddleware([UserRole.USER, UserRole.STYLIST, UserRole.ADMIN]),
  controller.getAvailableSlots.bind(controller),
);

router.get(
  SLOT_ROUTES.USER.AVAILABILITY,
  authMiddleware,
  roleMiddleware([UserRole.USER, UserRole.STYLIST, UserRole.ADMIN]),
  controller.getDynamicAvailability.bind(controller),
);

router.post(
  SLOT_ROUTES.USER.LOCK,
  authMiddleware,
  roleMiddleware([UserRole.USER]),
  controller.lockSlot.bind(controller),
);

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
  roleMiddleware([UserRole.STYLIST]),
  controller.getStylistSlots.bind(controller),
);

export default router;
