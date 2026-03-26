import { Router } from 'express';
import { resolveServiceController } from '../index';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { uploadMiddleware } from '../../../common/middleware/upload.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { API_ROUTES } from '../constants/service.routes';
import { validate } from '../../../common/middleware/validation.middleware';
import {
  CreateServiceSchema,
  UpdateServiceSchema,
  ServicePaginationSchema,
} from '../dto/service.schema';

const router = Router();
const controller = resolveServiceController();

// PUBLIC
router.get(API_ROUTES.PUBLIC.SERVICE.LIST, controller.listPublic.bind(controller));
router.get(API_ROUTES.PUBLIC.SERVICE.BY_ID(':id'), controller.getPublic.bind(controller));
router.get(
  API_ROUTES.PUBLIC.SERVICE.PAGINATED,
  validate({ query: ServicePaginationSchema }),
  controller.listPublicPaginated.bind(controller),
);

router.use('/admin', authMiddleware, roleMiddleware([UserRole.ADMIN]));

router.get(API_ROUTES.ADMIN.SERVICE.BASE, controller.listAdmin.bind(controller));

router.get(
  API_ROUTES.ADMIN.SERVICE.PAGINATED,
  validate({ query: ServicePaginationSchema }),
  controller.getPaginatedServices.bind(controller),
);

router.post(
  API_ROUTES.ADMIN.SERVICE.BASE,
  validate({ body: CreateServiceSchema }),
  controller.create.bind(controller),
);

router.patch(
  API_ROUTES.ADMIN.SERVICE.BY_ID(':id'),
  validate({ body: UpdateServiceSchema }),
  controller.update.bind(controller),
);

router.patch(API_ROUTES.ADMIN.SERVICE.SOFT_DELETE(':id'), controller.softDelete.bind(controller));

router.patch(API_ROUTES.ADMIN.SERVICE.RESTORE(':id'), controller.restore.bind(controller));

router.post(
  API_ROUTES.ADMIN.SERVICE.UPLOAD_IMAGE(':id'),
  uploadMiddleware.single('image'),
  controller.uploadImage.bind(controller),
);

router.delete(
  API_ROUTES.ADMIN.SERVICE.DELETE_IMAGE(':id'),
  controller.deleteImage.bind(controller),
);

export default router;
