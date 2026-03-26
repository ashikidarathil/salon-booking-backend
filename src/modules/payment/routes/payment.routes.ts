import { Router } from 'express';
import { resolvePaymentController } from '../index';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { API_ROUTES } from '../constants/payment.routes';
import { validate } from '../../../common/middleware/validation.middleware';
import {
  CreateOrderSchema,
  PaymentVerificationSchema,
  PayWithWalletSchema,
  CreateRemainingOrderSchema,
  PayRemainingWithWalletSchema,
} from '../dto/payment.schema';

const router = Router();
const controller = resolvePaymentController();

router.use(authMiddleware);

// User routes
router.post(
  API_ROUTES.USER.CREATE_ORDER,
  validate({ body: CreateOrderSchema }),
  controller.createOrder,
);

router.post(
  API_ROUTES.USER.VERIFY,
  validate({ body: PaymentVerificationSchema }),
  controller.verifyPayment,
);

router.post(
  API_ROUTES.USER.PAY_WITH_WALLET,
  validate({ body: PayWithWalletSchema }),
  controller.payWithWallet,
);

router.post(
  API_ROUTES.USER.PAY_REMAINING_ORDER,
  validate({ body: CreateRemainingOrderSchema }),
  controller.createRemainingOrder,
);

router.post(
  API_ROUTES.USER.PAY_REMAINING_WALLET,
  validate({ body: PayRemainingWithWalletSchema }),
  controller.payRemainingWithWallet,
);

// Admin routes
router.get(API_ROUTES.ADMIN.BASE, roleMiddleware([UserRole.ADMIN]), controller.getPaymentById);

export default router;
