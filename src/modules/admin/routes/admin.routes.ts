import { Router } from 'express';
import { resolveUserController } from '../index';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';

const router = Router();
const userController = resolveUserController();

router.get(
  '/users',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  userController.getAllUsers.bind(userController),
);

router.patch(
  '/users/:userId/block',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  userController.toggleBlock.bind(userController),
);

export default router;
