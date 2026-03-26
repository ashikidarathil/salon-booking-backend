import { Router } from 'express';
import { resolveSlotController } from '../index';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { SLOT_ROUTES } from '../constants/slot.routes';
import { validate } from '../../../common/middleware/validation.middleware';
import {
  GetAvailableSlotsQuerySchema,
  BlockSlotSchema,
  CreateSpecialSlotSchema,
  ListSpecialSlotsQuerySchema,
} from '../dto/slot.schema';

const router = Router();
const controller = resolveSlotController();

// USER ROUTES
router.get(
  SLOT_ROUTES.USER.LIST,
  validate({ query: GetAvailableSlotsQuerySchema }),
  controller.getAvailableSlots.bind(controller),
);

router.get(SLOT_ROUTES.USER.AVAILABILITY, controller.getDynamicAvailability.bind(controller));

router.use(['/slots/admin', '/slots/:slotId', '/slots/stylist', '/slots/special'], authMiddleware);

// ADMIN ROUTES
router.get(
  SLOT_ROUTES.ADMIN.LIST,
  roleMiddleware([UserRole.ADMIN]),
  controller.adminListSlots.bind(controller),
);

router.patch(
  SLOT_ROUTES.ADMIN.BLOCK,
  roleMiddleware([UserRole.ADMIN, UserRole.STYLIST]),
  validate({ body: BlockSlotSchema }),
  controller.blockSlot.bind(controller),
);

router.patch(
  SLOT_ROUTES.ADMIN.UNBLOCK,
  roleMiddleware([UserRole.ADMIN, UserRole.STYLIST]),
  controller.unblockSlot.bind(controller),
);

router.get(
  SLOT_ROUTES.STYLIST.LIST,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN]),
  controller.getStylistSlots.bind(controller),
);

router.post(
  SLOT_ROUTES.ADMIN.CREATE_SPECIAL,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN]),
  validate({ body: CreateSpecialSlotSchema }),
  controller.createSpecialSlot.bind(controller),
);

router.get(
  SLOT_ROUTES.ADMIN.LIST_SPECIAL,
  roleMiddleware([UserRole.ADMIN, UserRole.STYLIST]),
  validate({ query: ListSpecialSlotsQuerySchema }),
  controller.listSpecialSlots.bind(controller),
);

router.delete(
  SLOT_ROUTES.ADMIN.CANCEL_SPECIAL,
  roleMiddleware([UserRole.ADMIN, UserRole.STYLIST]),
  controller.cancelSpecialSlot.bind(controller),
);

export default router;
