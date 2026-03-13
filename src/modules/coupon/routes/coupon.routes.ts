import { Router } from 'express';
import { resolveCouponController } from '../index';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { API_ROUTES } from '../constants/coupon.routes';

const router = Router();
const controller = resolveCouponController();

// User routes (Publicly authenticated)
router.post(API_ROUTES.USER.VALIDATE, authMiddleware, controller.validateCoupon.bind(controller));
router.get(API_ROUTES.USER.AVAILABLE, authMiddleware, controller.listAvailableCoupons.bind(controller));

// Admin routes
router.post(
  API_ROUTES.ADMIN.BASE,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.createCoupon.bind(controller),
);

router.get(
  API_ROUTES.ADMIN.BASE,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.listAllCoupons.bind(controller),
);

router.put(
  API_ROUTES.ADMIN.UPDATE,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.updateCoupon.bind(controller),
);

router.patch(
  API_ROUTES.ADMIN.TOGGLE_STATUS,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.toggleStatus.bind(controller),
);

router.patch(
  API_ROUTES.ADMIN.DELETE,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.toggleDelete.bind(controller),
);

export default router;
