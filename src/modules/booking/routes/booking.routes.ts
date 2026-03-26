import { Router } from 'express';
import { resolveBookingController } from '../index';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { BOOKING_ROUTES } from '../constants/booking.routes';
import { validate } from '../../../common/middleware/validation.middleware';
import {
  CreateBookingSchema,
  CancelBookingSchema,
  RescheduleBookingSchema,
  UpdateBookingStatusSchema,
  BookingPaginationSchema,
  BookingStatsSchema,
} from '../dto/booking.schema';

const router = Router();
const controller = resolveBookingController();

router.use(['/bookings', '/admin', '/stylist'], authMiddleware);

// ─── User Routes ───────────────────────────────────────────────────────────

router.post(
  BOOKING_ROUTES.USER.BASE,
  roleMiddleware([UserRole.USER, UserRole.STYLIST, UserRole.ADMIN]),
  validate({ body: CreateBookingSchema }),
  controller.create.bind(controller),
);

router.get(
  BOOKING_ROUTES.USER.MY_BOOKINGS,
  roleMiddleware([UserRole.USER, UserRole.STYLIST, UserRole.ADMIN]),
  validate({ query: BookingPaginationSchema }),
  controller.listMyBookings.bind(controller),
);

router.get(
  BOOKING_ROUTES.USER.BY_ID(':id'),
  roleMiddleware([UserRole.USER, UserRole.STYLIST, UserRole.ADMIN]),
  controller.getDetails.bind(controller),
);

router.patch(
  BOOKING_ROUTES.USER.CANCEL(':id'),
  roleMiddleware([UserRole.USER, UserRole.STYLIST, UserRole.ADMIN]),
  validate({ body: CancelBookingSchema }),
  controller.cancel.bind(controller),
);

router.patch(
  BOOKING_ROUTES.USER.RESCHEDULE(':id'),
  roleMiddleware([UserRole.USER, UserRole.STYLIST, UserRole.ADMIN]),
  validate({ body: RescheduleBookingSchema }),
  controller.reschedule.bind(controller),
);

router.patch(
  BOOKING_ROUTES.USER.STATUS(':id'),
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN]),
  validate({ body: UpdateBookingStatusSchema }),
  controller.updateStatus.bind(controller),
);

router.post(
  BOOKING_ROUTES.USER.APPLY_COUPON(':id'),
  roleMiddleware([UserRole.USER, UserRole.STYLIST, UserRole.ADMIN]),
  controller.applyCoupon.bind(controller),
);

router.post(
  BOOKING_ROUTES.USER.REMOVE_COUPON(':id'),
  roleMiddleware([UserRole.USER, UserRole.STYLIST, UserRole.ADMIN]),
  controller.removeCoupon.bind(controller),
);

// ─── Stylist Routes ────────────────────────────────────────────────────────

router.get(
  BOOKING_ROUTES.STYLIST.LIST,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN]),
  validate({ query: BookingPaginationSchema }),
  controller.listStylistBookings.bind(controller),
);

router.get(
  BOOKING_ROUTES.STYLIST.TODAY,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN]),
  controller.getStylistTodayBookings.bind(controller),
);

router.get(
  BOOKING_ROUTES.STYLIST.STATS,
  roleMiddleware([UserRole.STYLIST, UserRole.ADMIN]),
  validate({ query: BookingStatsSchema }),
  controller.getStylistStats.bind(controller),
);

// ─── Admin Routes ──────────────────────────────────────────────────────────

router.get(
  BOOKING_ROUTES.ADMIN.LIST,
  roleMiddleware([UserRole.ADMIN]),
  validate({ query: BookingPaginationSchema }),
  controller.listAll.bind(controller),
);

router.get(
  BOOKING_ROUTES.ADMIN.TODAY,
  roleMiddleware([UserRole.ADMIN]),
  controller.getTodayBookings.bind(controller),
);

export default router;
