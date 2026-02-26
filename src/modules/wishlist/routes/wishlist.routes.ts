import { Router } from 'express';
import { container } from 'tsyringe';
import { WishlistController } from '../controller/WishlistController';
import { authMiddleware } from '../../../common/middleware/auth.middleware';

import { WISHLIST_ROUTES } from '../constants/wishlist.constants';

const router = Router();
const controller = container.resolve(WishlistController);

router.post(WISHLIST_ROUTES.BASE + WISHLIST_ROUTES.TOGGLE, authMiddleware, controller.toggle);
router.get(WISHLIST_ROUTES.BASE + WISHLIST_ROUTES.ME, authMiddleware, controller.getMyFavorites);

export default router;
