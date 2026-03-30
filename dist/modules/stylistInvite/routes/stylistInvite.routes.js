"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const __1 = require("..");
const auth_middleware_1 = require("../../../common/middleware/auth.middleware");
const optionalAuth_middleware_1 = require("../../../common/middleware/optionalAuth.middleware");
const role_middleware_1 = require("../../../common/middleware/role.middleware");
const userRole_enum_1 = require("../../../common/enums/userRole.enum");
const auth_1 = require("../../auth");
const stylistInvite_routes_1 = require("../constants/stylistInvite.routes");
const validation_middleware_1 = require("../../../common/middleware/validation.middleware");
const stylistInvite_schema_1 = require("../dto/stylistInvite.schema");
const router = (0, express_1.Router)();
const inviteController = (0, __1.resolveStylistInviteController)();
const stylistController = (0, __1.resolveStylistController)();
const authController = (0, auth_1.resolveAuthController)();
/** Admin */
router.use('/admin', auth_middleware_1.authMiddleware, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.ADMIN]));
router.get(stylistInvite_routes_1.STYLIST_INVITE_ROUTES.ADMIN_LIST_STYLISTS, stylistController.list.bind(stylistController));
router.get(stylistInvite_routes_1.STYLIST_INVITE_ROUTES.ADMIN_PAGINATED_LIST_STYLIST, (0, validation_middleware_1.validate)({ query: stylistInvite_schema_1.StylistPaginationSchema }), stylistController.getStylists.bind(stylistController));
router.patch(stylistInvite_routes_1.STYLIST_INVITE_ROUTES.ADMIN_BLOCK_NEW, (0, validation_middleware_1.validate)({ body: stylistInvite_schema_1.StylistBlockSchema }), stylistController.toggleBlock.bind(stylistController));
router.patch(stylistInvite_routes_1.STYLIST_INVITE_ROUTES.ADMIN_UPDATE_POSITION, (0, validation_middleware_1.validate)({ body: stylistInvite_schema_1.StylistPositionSchema }), stylistController.updatePosition.bind(stylistController));
router.post(stylistInvite_routes_1.STYLIST_INVITE_ROUTES.ADMIN_SEND_INVITE_TO_APPLIED, inviteController.sendInviteToApplied.bind(inviteController));
router.post(stylistInvite_routes_1.STYLIST_INVITE_ROUTES.ADMIN_MANUAL_INVITE, (0, validation_middleware_1.validate)({ body: stylistInvite_schema_1.CreateStylistInviteSchema }), inviteController.createInvite.bind(inviteController));
router.post(stylistInvite_routes_1.STYLIST_INVITE_ROUTES.ADMIN_APPROVE, inviteController.approve.bind(inviteController));
router.post(stylistInvite_routes_1.STYLIST_INVITE_ROUTES.ADMIN_REJECT, inviteController.reject.bind(inviteController));
/** Public */
router.get(stylistInvite_routes_1.STYLIST_INVITE_ROUTES.PUBLIC_VALIDATE_INVITE, (0, validation_middleware_1.validate)({ params: stylistInvite_schema_1.ValidateStylistInviteSchema }), inviteController.validate.bind(inviteController));
router.post(stylistInvite_routes_1.STYLIST_INVITE_ROUTES.PUBLIC_ACCEPT_INVITE, (0, validation_middleware_1.validate)({ body: stylistInvite_schema_1.AcceptStylistInviteSchema }), inviteController.accept.bind(inviteController));
/** Apply stylist (from AuthController) */
router.post(stylistInvite_routes_1.STYLIST_INVITE_ROUTES.PUBLIC_APPLY_STYLIST, authController.applyAsStylist.bind(authController));
/** Public Stylist Listing & Profile */
router.get(stylistInvite_routes_1.STYLIST_INVITE_ROUTES.PUBLIC_LIST_STYLISTS, optionalAuth_middleware_1.optionalAuthMiddleware, (0, validation_middleware_1.validate)({ query: stylistInvite_schema_1.StylistPaginationSchema }), stylistController.getPublicStylists.bind(stylistController));
router.get(stylistInvite_routes_1.STYLIST_INVITE_ROUTES.PUBLIC_GET_STYLIST_BY_ID, optionalAuth_middleware_1.optionalAuthMiddleware, stylistController.getPublicStylistById.bind(stylistController));
exports.default = router;
