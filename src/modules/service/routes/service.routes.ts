import { Router } from 'express';
import { resolveServiceController } from '../index';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { uploadMiddleware } from '../../../common/middleware/upload.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { API_ROUTES } from '../constants/service.routes';

const router = Router();
const controller = resolveServiceController();

// PUBLIC
router.get(API_ROUTES.PUBLIC.SERVICE.LIST, controller.listPublic.bind(controller));

// ADMIN

router.get(
  API_ROUTES.ADMIN.SERVICE.BASE,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.listAdmin.bind(controller),
);

router.get(
  '/admin/services/paginated',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.getPaginatedServices.bind(controller),
);

router.post(
  API_ROUTES.ADMIN.SERVICE.BASE,
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.create.bind(controller),
);

router.patch(
  API_ROUTES.ADMIN.SERVICE.BY_ID(':id'),
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.update.bind(controller),
);

router.patch(
  API_ROUTES.ADMIN.SERVICE.SOFT_DELETE(':id'),
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.softDelete.bind(controller),
);

router.patch(
  API_ROUTES.ADMIN.SERVICE.RESTORE(':id'),
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.restore.bind(controller),
);

router.post(
  API_ROUTES.ADMIN.SERVICE.UPLOAD_IMAGE(':id'),
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  uploadMiddleware.single('image'),
  controller.uploadImage.bind(controller),
);

router.patch(
  API_ROUTES.ADMIN.SERVICE.UPLOAD_IMAGE(':id'),
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  uploadMiddleware.single('image'),
  controller.uploadImage.bind(controller),
);

router.delete(
  API_ROUTES.ADMIN.SERVICE.DELETE_IMAGE(':id'),
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  controller.deleteImage.bind(controller),
);

export default router;
