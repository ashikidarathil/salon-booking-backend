import { Router } from 'express';
import { resolveStylistInviteController, resolveStylistController } from '..';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { resolveAuthController } from '../../auth';

const router = Router();

const inviteController = resolveStylistInviteController();
const stylistController = resolveStylistController();
const authController = resolveAuthController();

router.get(
  '/admin/stylists',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  stylistController.list.bind(stylistController),
);

router.post(
  '/admin/stylists/:userId/send-invite',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  inviteController.sendInviteToApplied.bind(inviteController),
);

router.post(
  '/admin/stylists/invite',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  inviteController.createInvite.bind(inviteController),
);

router.post(
  '/admin/stylists/:userId/approve',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  inviteController.approve.bind(inviteController),
);

router.post(
  '/admin/stylists/:userId/reject',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  inviteController.reject.bind(inviteController),
);

router.post(
  '/admin/stylists/:userId/block',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  inviteController.toggleBlock.bind(inviteController),
);

router.get('/stylists/invite/:token', inviteController.validate.bind(inviteController));
router.post('/stylists/invite/:token/accept', inviteController.accept.bind(inviteController));

router.post('/apply-stylist', authController.applyAsStylist.bind(authController));

export default router;
