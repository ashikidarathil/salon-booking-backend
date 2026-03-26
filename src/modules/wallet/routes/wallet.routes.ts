import { Router } from 'express';
import { resolveWalletController } from '../index';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { WALLET_ROUTES } from '../constants/wallet.routes';
import { validate } from '../../../common/middleware/validation.middleware';
import {
  CreditWalletSchema,
  CreateTopupOrderSchema,
  VerifyTopupSchema,
} from '../dto/wallet.schema';

const router = Router();
const controller = resolveWalletController();

router.use(authMiddleware);

router.get(WALLET_ROUTES.ME, controller.getMyWallet.bind(controller));

router.get(WALLET_ROUTES.TRANSACTIONS, controller.getTransactionHistory.bind(controller));

router.post(
  WALLET_ROUTES.CREDIT,
  validate({ body: CreditWalletSchema }),
  controller.creditMyWallet.bind(controller),
);

router.post(
  WALLET_ROUTES.TOPUP_ORDER,
  validate({ body: CreateTopupOrderSchema }),
  controller.createTopupOrder.bind(controller),
);

router.post(
  WALLET_ROUTES.TOPUP_VERIFY,
  validate({ body: VerifyTopupSchema }),
  controller.verifyTopup.bind(controller),
);

export default router;
