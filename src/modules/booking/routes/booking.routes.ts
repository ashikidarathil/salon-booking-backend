import { Router } from 'express';
import { resolveBookingController } from '../index';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { BOOKING_ROUTES } from '../constants/booking.routes';

const router = Router();
const controller = resolveBookingController();

// USER ROUTES
router.post(
  BOOKING_ROUTES.USER.BASE,
  authMiddleware,
  roleMiddleware([UserRole.USER]),
  controller.create.bind(controller),
);

router.get(
  BOOKING_ROUTES.USER.MY_BOOKINGS,
  authMiddleware,
  roleMiddleware([UserRole.USER, UserRole.STYLIST, UserRole.ADMIN]),
  controller.listMyBookings.bind(controller),
);

router.get(
  BOOKING_ROUTES.USER.BY_ID(':id'),
  authMiddleware,
  roleMiddleware([UserRole.USER, UserRole.STYLIST, UserRole.ADMIN]),
  controller.getDetails.bind(controller),
);

router.patch(
  BOOKING_ROUTES.USER.CANCEL(':id'),
  authMiddleware,
  roleMiddleware([UserRole.USER]),
  controller.cancel.bind(controller),
);

router.post(
  BOOKING_ROUTES.USER.EXTEND(':id'),
  authMiddleware,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN]),
  controller.extend.bind(controller),
);

// ADMIN ROUTES
router.get(
  BOOKING_ROUTES.ADMIN.LIST,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  // controller.listAll.bind(controller) // Need to add this to controller if needed, but for now routes definition
);

export default router;
