import { Router } from 'express';
import { resolveStylistWalletController } from '../index';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { STYLIST_WALLET_ROUTES } from '../constants/stylistWallet.routes';
import { validate } from '../../../common/middleware/validation.middleware';
import { GetStylistWalletSchema } from '../dto/stylistWallet.schema';

const router = Router();
const controller = resolveStylistWalletController();

router.use(authMiddleware);

// ─── Stylist Routes ──────────────────────────────────────────────────────────

router.get(
  STYLIST_WALLET_ROUTES.STYLIST.MY_WALLET,
  roleMiddleware([UserRole.STYLIST]),
  controller.getStylistWallet.bind(controller),
);

// ─── Admin Routes ─────────────────────────────────────────────────────────────

router.get(
  STYLIST_WALLET_ROUTES.ADMIN.STYLIST_WALLET,
  roleMiddleware([UserRole.ADMIN]),
  validate({ params: GetStylistWalletSchema }),
  controller.getWalletByStylistId.bind(controller),
);

export default router;
