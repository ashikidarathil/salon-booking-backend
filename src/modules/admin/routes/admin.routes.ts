import { Router } from 'express';
import { resolveUserController, resolveAdminDashboardController } from '../index';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { API_ROUTES } from '../constants/routes';

const router = Router();
const userController = resolveUserController();
const dashboardController = resolveAdminDashboardController();

router.patch(
  API_ROUTES.ADMIN.USERS.TOGGLE_BLOCK(':userId'),
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  userController.toggleBlock.bind(userController),
);

router.get(
  API_ROUTES.ADMIN.USERS.GET_USERS,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  userController.getUsers.bind(userController),
);

router.get(
  API_ROUTES.ADMIN.DASHBOARD.STATS,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  dashboardController.getStats.bind(dashboardController),
);

export default router;
