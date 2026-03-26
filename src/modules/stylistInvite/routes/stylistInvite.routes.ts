import { Router } from 'express';
import { resolveStylistInviteController, resolveStylistController } from '..';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { optionalAuthMiddleware } from '../../../common/middleware/optionalAuth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { resolveAuthController } from '../../auth';
import { STYLIST_INVITE_ROUTES } from '../constants/stylistInvite.routes';
import { validate } from '../../../common/middleware/validation.middleware';
import {
  CreateStylistInviteSchema,
  AcceptStylistInviteSchema,
  ValidateStylistInviteSchema,
  StylistPaginationSchema,
  StylistBlockSchema,
  StylistPositionSchema,
} from '../dto/stylistInvite.schema';

const router = Router();

const inviteController = resolveStylistInviteController();
const stylistController = resolveStylistController();
const authController = resolveAuthController();

/** Admin */
router.use('/admin', authMiddleware, roleMiddleware([UserRole.ADMIN]));

router.get(
  STYLIST_INVITE_ROUTES.ADMIN_LIST_STYLISTS,
  stylistController.list.bind(stylistController),
);

router.get(
  STYLIST_INVITE_ROUTES.ADMIN_PAGINATED_LIST_STYLIST,
  validate({ query: StylistPaginationSchema }),
  stylistController.getStylists.bind(stylistController),
);

router.patch(
  STYLIST_INVITE_ROUTES.ADMIN_BLOCK_NEW,
  validate({ body: StylistBlockSchema }),
  stylistController.toggleBlock.bind(stylistController),
);

router.patch(
  STYLIST_INVITE_ROUTES.ADMIN_UPDATE_POSITION,
  validate({ body: StylistPositionSchema }),
  stylistController.updatePosition.bind(stylistController),
);

router.post(
  STYLIST_INVITE_ROUTES.ADMIN_SEND_INVITE_TO_APPLIED,
  inviteController.sendInviteToApplied.bind(inviteController),
);

router.post(
  STYLIST_INVITE_ROUTES.ADMIN_MANUAL_INVITE,
  validate({ body: CreateStylistInviteSchema }),
  inviteController.createInvite.bind(inviteController),
);

router.post(STYLIST_INVITE_ROUTES.ADMIN_APPROVE, inviteController.approve.bind(inviteController));

router.post(STYLIST_INVITE_ROUTES.ADMIN_REJECT, inviteController.reject.bind(inviteController));

/** Public */
router.get(
  STYLIST_INVITE_ROUTES.PUBLIC_VALIDATE_INVITE,
  validate({ params: ValidateStylistInviteSchema }),
  inviteController.validate.bind(inviteController),
);

router.post(
  STYLIST_INVITE_ROUTES.PUBLIC_ACCEPT_INVITE,
  validate({ body: AcceptStylistInviteSchema }),
  inviteController.accept.bind(inviteController),
);

/** Apply stylist (from AuthController) */
router.post(
  STYLIST_INVITE_ROUTES.PUBLIC_APPLY_STYLIST,
  authController.applyAsStylist.bind(authController),
);

/** Public Stylist Listing & Profile */
router.get(
  STYLIST_INVITE_ROUTES.PUBLIC_LIST_STYLISTS,
  optionalAuthMiddleware,
  validate({ query: StylistPaginationSchema }),
  stylistController.getPublicStylists.bind(stylistController),
);

router.get(
  STYLIST_INVITE_ROUTES.PUBLIC_GET_STYLIST_BY_ID,
  optionalAuthMiddleware,
  stylistController.getPublicStylistById.bind(stylistController),
);

export default router;
