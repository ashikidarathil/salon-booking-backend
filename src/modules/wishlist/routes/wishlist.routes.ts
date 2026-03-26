import { Router } from 'express';
import { container } from 'tsyringe';
import { WishlistController } from '../controller/WishlistController';
import { authMiddleware } from '../../../common/middleware/auth.middleware';

import { WISHLIST_ROUTES } from '../constants/wishlist.constants';
import { validate } from '../../../common/middleware/validation.middleware';
import { WishlistToggleSchema } from '../dto/wishlist.schema';

const router = Router();
const controller = container.resolve(WishlistController);

router.use('/wishlist', authMiddleware);

router.post(
  WISHLIST_ROUTES.BASE + WISHLIST_ROUTES.TOGGLE,
  validate({ body: WishlistToggleSchema }),
  controller.toggle,
);
router.get(WISHLIST_ROUTES.BASE + WISHLIST_ROUTES.ME, controller.getMyFavorites);

export default router;
