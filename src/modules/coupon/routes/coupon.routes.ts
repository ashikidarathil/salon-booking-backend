import { Router } from 'express';
import { resolveCouponController } from '../index';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { API_ROUTES } from '../constants/coupon.routes';
import { validate } from '../../../common/middleware/validation.middleware';
import {
  CreateCouponSchema,
  UpdateCouponSchema,
  ValidateCouponSchema,
  CouponPaginationSchema,
} from '../dto/coupon.schema';

const router = Router();
const controller = resolveCouponController();

router.use(authMiddleware);

router.post(
  API_ROUTES.USER.VALIDATE,
  validate({ body: ValidateCouponSchema }),
  controller.validateCoupon.bind(controller),
);
router.get(API_ROUTES.USER.AVAILABLE, controller.listAvailableCoupons.bind(controller));

// Admin routes
router.post(
  API_ROUTES.ADMIN.BASE,
  roleMiddleware([UserRole.ADMIN]),
  validate({ body: CreateCouponSchema }),
  controller.createCoupon.bind(controller),
);

router.get(
  API_ROUTES.ADMIN.BASE,
  roleMiddleware([UserRole.ADMIN]),
  validate({ query: CouponPaginationSchema }),
  controller.listAllCoupons.bind(controller),
);

router.put(
  API_ROUTES.ADMIN.UPDATE,
  roleMiddleware([UserRole.ADMIN]),
  validate({ body: UpdateCouponSchema }),
  controller.updateCoupon.bind(controller),
);

router.patch(
  API_ROUTES.ADMIN.TOGGLE_STATUS,
  roleMiddleware([UserRole.ADMIN]),
  controller.toggleStatus.bind(controller),
);

router.patch(
  API_ROUTES.ADMIN.DELETE,
  roleMiddleware([UserRole.ADMIN]),
  controller.toggleDelete.bind(controller),
);

export default router;
