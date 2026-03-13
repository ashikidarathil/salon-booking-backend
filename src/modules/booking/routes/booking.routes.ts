import { Router } from 'express';
import { resolveBookingController } from '../index';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { BOOKING_ROUTES } from '../constants/booking.routes';

const router = Router();
const controller = resolveBookingController();

// ─── User Routes ───────────────────────────────────────────────────────────

router.post(
  BOOKING_ROUTES.USER.BASE,
  authMiddleware,
  roleMiddleware([UserRole.USER, UserRole.STYLIST, UserRole.ADMIN]),
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
  roleMiddleware([UserRole.USER, UserRole.STYLIST, UserRole.ADMIN]),
  controller.cancel.bind(controller),
);

router.patch(
  BOOKING_ROUTES.USER.RESCHEDULE(':id'),
  authMiddleware,
  roleMiddleware([UserRole.USER, UserRole.STYLIST, UserRole.ADMIN]),
  controller.reschedule.bind(controller),
);

router.patch(
  BOOKING_ROUTES.USER.STATUS(':id'),
  authMiddleware,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN]),
  controller.updateStatus.bind(controller),
);

router.post(
  BOOKING_ROUTES.USER.APPLY_COUPON(':id'),
  authMiddleware,
  roleMiddleware([UserRole.USER, UserRole.STYLIST, UserRole.ADMIN]),
  controller.applyCoupon.bind(controller),
);

router.post(
  BOOKING_ROUTES.USER.REMOVE_COUPON(':id'),
  authMiddleware,
  roleMiddleware([UserRole.USER, UserRole.STYLIST, UserRole.ADMIN]),
  controller.removeCoupon.bind(controller),
);

// ─── Stylist Routes ────────────────────────────────────────────────────────

router.get(
  BOOKING_ROUTES.STYLIST.LIST,
  authMiddleware,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN]),
  controller.listStylistBookings.bind(controller),
);

router.get(
  BOOKING_ROUTES.STYLIST.TODAY,
  authMiddleware,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN]),
  controller.getStylistTodayBookings.bind(controller),
);

router.get(
  BOOKING_ROUTES.STYLIST.STATS,
  authMiddleware,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN]),
  controller.getStylistStats.bind(controller),
);

// ─── Admin Routes ──────────────────────────────────────────────────────────

router.get(
  BOOKING_ROUTES.ADMIN.LIST,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.listAll.bind(controller),
);

router.get(
  BOOKING_ROUTES.ADMIN.TODAY,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.getTodayBookings.bind(controller),
);

export default router;
