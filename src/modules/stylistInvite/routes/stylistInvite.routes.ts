import { Router } from 'express';
import { resolveStylistInviteController, resolveStylistController } from '..';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { resolveAuthController } from '../../auth';
import { STYLIST_INVITE_ROUTES } from '../constants/stylistInvite.routes';

const router = Router();

const inviteController = resolveStylistInviteController();
const stylistController = resolveStylistController();
const authController = resolveAuthController();

/** Admin */
router.get(
  STYLIST_INVITE_ROUTES.ADMIN_LIST_STYLISTS,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  stylistController.list.bind(stylistController),
);

router.get(
  STYLIST_INVITE_ROUTES.ADMIN_PAGINATED_LIST_STYLIST,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  stylistController.getStylists.bind(stylistController),
);

router.patch(
  STYLIST_INVITE_ROUTES.ADMIN_BLOCK_NEW,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  stylistController.toggleBlock.bind(stylistController),
);

router.post(
  STYLIST_INVITE_ROUTES.ADMIN_SEND_INVITE_TO_APPLIED,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  inviteController.sendInviteToApplied.bind(inviteController),
);

router.post(
  STYLIST_INVITE_ROUTES.ADMIN_MANUAL_INVITE,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  inviteController.createInvite.bind(inviteController),
);

router.post(
  STYLIST_INVITE_ROUTES.ADMIN_APPROVE,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  inviteController.approve.bind(inviteController),
);

router.post(
  STYLIST_INVITE_ROUTES.ADMIN_REJECT,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  inviteController.reject.bind(inviteController),
);

// router.post(
//   STYLIST_INVITE_ROUTES.ADMIN_BLOCK,
//   authMiddleware,
//   roleMiddleware([UserRole.ADMIN]),
//   inviteController.toggleBlock.bind(inviteController),
// );

/** Public */
router.get(
  STYLIST_INVITE_ROUTES.PUBLIC_VALIDATE_INVITE,
  inviteController.validate.bind(inviteController),
);

router.post(
  STYLIST_INVITE_ROUTES.PUBLIC_ACCEPT_INVITE,
  inviteController.accept.bind(inviteController),
);

/** Apply stylist (from AuthController) */
router.post(
  STYLIST_INVITE_ROUTES.PUBLIC_APPLY_STYLIST,
  authController.applyAsStylist.bind(authController),
);

export default router;
