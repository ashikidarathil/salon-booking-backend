import { Router } from 'express';
import { CHAT_ROUTES } from '../constants/chat.routes';
import { resolveChatController } from '../index';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { chatUploadMiddleware } from '../../../common/middleware/upload.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';

const router = Router();
const controller = resolveChatController();

router.use(authMiddleware);

router.get(`${CHAT_ROUTES.BASE}/user`, controller.getUserRooms);
router.get(`${CHAT_ROUTES.BASE}/stylist`, controller.getStylistRooms);
router.get(`${CHAT_ROUTES.BASE}/admin`, roleMiddleware([UserRole.ADMIN]), controller.getAllRoomsAdmin);
router.get(`${CHAT_ROUTES.BASE}${CHAT_ROUTES.MESSAGES}`, controller.getRoomMessages);
router.patch(`${CHAT_ROUTES.BASE}${CHAT_ROUTES.READ}`, controller.markAsRead);
router.get(`${CHAT_ROUTES.BASE}/:roomId/unread`, controller.getUnreadCount);

router.post(`${CHAT_ROUTES.BASE}/initialize`, controller.initializeRoom);

router.post(
  `${CHAT_ROUTES.BASE}${CHAT_ROUTES.UPLOAD}`,
  chatUploadMiddleware.single('file'),
  controller.uploadMedia,
);

export default router;
