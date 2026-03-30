"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const review_controller_1 = require("../controller/review.controller");
const validation_middleware_1 = require("../../../common/middleware/validation.middleware");
const auth_middleware_1 = require("../../../common/middleware/auth.middleware");
const role_middleware_1 = require("../../../common/middleware/role.middleware");
const userRole_enum_1 = require("../../../common/enums/userRole.enum");
const review_schema_1 = require("../dto/review.schema");
const review_routes_1 = require("../constants/review.routes");
const router = (0, express_1.Router)();
const controller = tsyringe_1.container.resolve(review_controller_1.ReviewController);
// Public routes
router.get(review_routes_1.REVIEW_ROUTES.TOP_STYLISTS, (req, res) => controller.getTopStylists(req, res));
router.get(review_routes_1.REVIEW_ROUTES.TOP_SERVICES, (req, res) => controller.getTopServices(req, res));
router.get(review_routes_1.REVIEW_ROUTES.STYLIST_RATING, (req, res) => controller.getStylistRating(req, res));
router.get(review_routes_1.REVIEW_ROUTES.BASE, (0, validation_middleware_1.validate)({ query: review_schema_1.ReviewPaginationSchema }), (req, res) => controller.listReviews(req, res));
router.use(auth_middleware_1.authMiddleware);
// User routes
router.post(review_routes_1.REVIEW_ROUTES.BASE, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.USER]), (0, validation_middleware_1.validate)({ body: review_schema_1.CreateReviewSchema }), (req, res) => controller.createReview(req, res));
// Admin routes
router.use((0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.ADMIN]));
router.delete(review_routes_1.REVIEW_ROUTES.BY_ID, (req, res) => controller.deleteReview(req, res));
router.post(review_routes_1.REVIEW_ROUTES.RESTORE, (req, res) => controller.restoreReview(req, res));
exports.default = router;
