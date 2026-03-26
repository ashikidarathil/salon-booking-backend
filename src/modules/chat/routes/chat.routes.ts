import { Router } from 'express';
import { CHAT_ROUTES } from '../constants/chat.routes';
import { resolveChatController } from '../index';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { chatUploadMiddleware } from '../../../common/middleware/upload.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { validate } from '../../../common/middleware/validation.middleware';
import { InitializeRoomSchema, ChatPaginationSchema } from '../dto/chat.schema';

const router = Router();
const controller = resolveChatController();

router.use('/rooms', authMiddleware);

router.get(
  CHAT_ROUTES.USER_ROOMS,
  validate({ query: ChatPaginationSchema }),
  controller.getUserRooms,
);
router.get(
  CHAT_ROUTES.STYLIST_ROOMS,
  validate({ query: ChatPaginationSchema }),
  controller.getStylistRooms,
);
router.get(
  CHAT_ROUTES.ADMIN_ROOMS,
  roleMiddleware([UserRole.ADMIN]),
  validate({ query: ChatPaginationSchema }),
  controller.getAllRoomsAdmin,
);
router.get(
  `${CHAT_ROUTES.BASE}${CHAT_ROUTES.MESSAGES}`,
  validate({ query: ChatPaginationSchema }),
  controller.getRoomMessages,
);
router.patch(`${CHAT_ROUTES.BASE}${CHAT_ROUTES.READ}`, controller.markAsRead);
router.get(CHAT_ROUTES.TOTAL_UNREAD, controller.getTotalUnreadCount);
router.get(CHAT_ROUTES.UNREAD, controller.getUnreadCount);

router.post(
  CHAT_ROUTES.INITIALIZE,
  validate({ body: InitializeRoomSchema }),
  controller.initializeRoom,
);

router.post(CHAT_ROUTES.UPLOAD, chatUploadMiddleware.single('file'), controller.uploadMedia);

export default router;
