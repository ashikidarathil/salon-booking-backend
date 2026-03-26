import { Router } from 'express';
import { container } from 'tsyringe';
import { ReviewController } from '../controller/review.controller';
import { validate } from '../../../common/middleware/validation.middleware';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/userRole.enum';
import { CreateReviewSchema, ReviewPaginationSchema } from '../dto/review.schema';
import { REVIEW_ROUTES } from '../constants/review.routes';

const router = Router();
const controller = container.resolve(ReviewController);

// Public routes
router.get(REVIEW_ROUTES.TOP_STYLISTS, (req, res) => controller.getTopStylists(req, res));
router.get(REVIEW_ROUTES.TOP_SERVICES, (req, res) => controller.getTopServices(req, res));
router.get(REVIEW_ROUTES.STYLIST_RATING, (req, res) => controller.getStylistRating(req, res));
router.get(REVIEW_ROUTES.BASE, validate({ query: ReviewPaginationSchema }), (req, res) =>
  controller.listReviews(req, res),
);

router.use(authMiddleware);

// User routes
router.post(
  REVIEW_ROUTES.BASE,
  roleMiddleware([UserRole.USER]),
  validate({ body: CreateReviewSchema }),
  (req, res) => controller.createReview(req, res),
);

// Admin routes
router.use(roleMiddleware([UserRole.ADMIN]));

router.delete(REVIEW_ROUTES.BY_ID, (req, res) => controller.deleteReview(req, res));

router.post(REVIEW_ROUTES.RESTORE, (req, res) => controller.restoreReview(req, res));

export default router;
