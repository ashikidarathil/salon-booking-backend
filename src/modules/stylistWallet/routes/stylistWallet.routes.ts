import { Router } from 'express';
import { resolveStylistWalletController } from '../index';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { STYLIST_WALLET_ROUTES } from '../constants/stylistWallet.routes';

const router = Router();
const controller = resolveStylistWalletController();

// ─── Stylist Routes ──────────────────────────────────────────────────────────

router.get(
  STYLIST_WALLET_ROUTES.STYLIST.MY_WALLET,
  authMiddleware,
  roleMiddleware([UserRole.STYLIST]),
  controller.getStylistWallet.bind(controller),
);

// ─── Admin Routes ─────────────────────────────────────────────────────────────

router.get(
  STYLIST_WALLET_ROUTES.ADMIN.STYLIST_WALLET,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.getWalletByStylistId.bind(controller),
);

export default router;
