import { Router } from 'express';
import { resolvePaymentController } from '../index';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { API_ROUTES } from '../constants/payment.routes';

const router = Router();
const controller = resolvePaymentController();

// User routes
router.post(API_ROUTES.USER.CREATE_ORDER, authMiddleware, controller.createOrder);

router.post(API_ROUTES.USER.VERIFY, authMiddleware, controller.verifyPayment);

router.post(API_ROUTES.USER.PAY_WITH_WALLET, authMiddleware, controller.payWithWallet);

router.post(API_ROUTES.USER.PAY_REMAINING_ORDER, authMiddleware, controller.createRemainingOrder);

router.post(
  API_ROUTES.USER.PAY_REMAINING_WALLET,
  authMiddleware,
  controller.payRemainingWithWallet,
);

// Admin routes
router.get(
  API_ROUTES.ADMIN.BASE,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.getPaymentById,
);

export default router;
