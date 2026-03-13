import { Router } from 'express';
import { resolveWalletController } from '../index';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { WALLET_ROUTES } from '../constants/wallet.routes';

const router = Router();
const controller = resolveWalletController();

router.get(WALLET_ROUTES.ME, authMiddleware, controller.getMyWallet.bind(controller));

router.get(
  WALLET_ROUTES.TRANSACTIONS,
  authMiddleware,
  controller.getTransactionHistory.bind(controller),
);

router.post(WALLET_ROUTES.CREDIT, authMiddleware, controller.creditMyWallet.bind(controller));

router.post(
  WALLET_ROUTES.TOPUP_ORDER,
  authMiddleware,
  controller.createTopupOrder.bind(controller),
);

router.post(WALLET_ROUTES.TOPUP_VERIFY, authMiddleware, controller.verifyTopup.bind(controller));

export default router;
