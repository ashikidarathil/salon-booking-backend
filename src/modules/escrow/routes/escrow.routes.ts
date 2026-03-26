import { Router } from 'express';
import { container } from 'tsyringe';
import { IEscrowController } from '../controller/IEscrowController';
import { TOKENS } from '../../../common/di/tokens';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { ESCROW_ROUTES } from '../constants/escrow.routes';
import { validate } from '../../../common/middleware/validation.middleware';
import { EscrowPaginationSchema } from '../dto/escrow.schema';

const router = Router();
const escrowController = container.resolve<IEscrowController>(TOKENS.EscrowController);

router.use(authMiddleware);

// Admin only routes
router.get(
  ESCROW_ROUTES.ADMIN_LIST,
  roleMiddleware([UserRole.ADMIN]),
  validate({ query: EscrowPaginationSchema }),
  escrowController.getAllEscrows,
);

router.get(
  ESCROW_ROUTES.ADMIN_STYLIST_LIST,
  roleMiddleware([UserRole.ADMIN]),
  validate({ query: EscrowPaginationSchema }),
  escrowController.getAdminStylistEscrows,
);

router.get(
  ESCROW_ROUTES.ADMIN_STYLIST_BALANCE,
  roleMiddleware([UserRole.ADMIN]),
  escrowController.getAdminStylistHeldBalance,
);

router.get(
  ESCROW_ROUTES.ADMIN_BY_BOOKING,
  roleMiddleware([UserRole.ADMIN]),
  escrowController.getEscrowByBooking,
);

// Stylist routes
router.get(
  ESCROW_ROUTES.STYLIST_LIST,
  roleMiddleware([UserRole.STYLIST]),
  validate({ query: EscrowPaginationSchema }),
  escrowController.getStylistEscrows,
);

router.get(
  ESCROW_ROUTES.STYLIST_BALANCE,
  roleMiddleware([UserRole.STYLIST]),
  escrowController.getHeldBalance,
);

export default router;
