"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const auth_middleware_1 = require("../../../common/middleware/auth.middleware");
const role_middleware_1 = require("../../../common/middleware/role.middleware");
const userRole_enum_1 = require("../../../common/enums/userRole.enum");
const escrow_routes_1 = require("../constants/escrow.routes");
const validation_middleware_1 = require("../../../common/middleware/validation.middleware");
const escrow_schema_1 = require("../dto/escrow.schema");
const router = (0, express_1.Router)();
const escrowController = tsyringe_1.container.resolve(tokens_1.TOKENS.EscrowController);
router.use(auth_middleware_1.authMiddleware);
// Admin only routes
router.get(escrow_routes_1.ESCROW_ROUTES.ADMIN_LIST, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.ADMIN]), (0, validation_middleware_1.validate)({ query: escrow_schema_1.EscrowPaginationSchema }), escrowController.getAllEscrows);
router.get(escrow_routes_1.ESCROW_ROUTES.ADMIN_STYLIST_LIST, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.ADMIN]), (0, validation_middleware_1.validate)({ query: escrow_schema_1.EscrowPaginationSchema }), escrowController.getAdminStylistEscrows);
router.get(escrow_routes_1.ESCROW_ROUTES.ADMIN_STYLIST_BALANCE, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.ADMIN]), escrowController.getAdminStylistHeldBalance);
router.get(escrow_routes_1.ESCROW_ROUTES.ADMIN_BY_BOOKING, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.ADMIN]), escrowController.getEscrowByBooking);
// Stylist routes
router.get(escrow_routes_1.ESCROW_ROUTES.STYLIST_LIST, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.STYLIST]), (0, validation_middleware_1.validate)({ query: escrow_schema_1.EscrowPaginationSchema }), escrowController.getStylistEscrows);
router.get(escrow_routes_1.ESCROW_ROUTES.STYLIST_BALANCE, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.STYLIST]), escrowController.getHeldBalance);
exports.default = router;
