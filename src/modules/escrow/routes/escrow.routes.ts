import { Router } from 'express';
import { container } from 'tsyringe';
import { IEscrowController } from '../controller/IEscrowController';
import { TOKENS } from '../../../common/di/tokens';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { ESCROW_ROUTES } from '../constants/escrow.routes';

const router = Router();
const escrowController = container.resolve<IEscrowController>(TOKENS.EscrowController);

// Admin only routes
router.get(
  ESCROW_ROUTES.ADMIN_LIST,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  escrowController.getAllEscrows,
);

router.get(
  ESCROW_ROUTES.ADMIN_BY_BOOKING,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  escrowController.getEscrowByBooking,
);

export default router;
