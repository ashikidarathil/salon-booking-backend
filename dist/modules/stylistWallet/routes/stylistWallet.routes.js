"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const auth_middleware_1 = require("../../../common/middleware/auth.middleware");
const role_middleware_1 = require("../../../common/middleware/role.middleware");
const userRole_enum_1 = require("../../../common/enums/userRole.enum");
const stylistWallet_routes_1 = require("../constants/stylistWallet.routes");
const validation_middleware_1 = require("../../../common/middleware/validation.middleware");
const stylistWallet_schema_1 = require("../dto/stylistWallet.schema");
const router = (0, express_1.Router)();
const controller = (0, index_1.resolveStylistWalletController)();
router.use(auth_middleware_1.authMiddleware);
// ─── Stylist Routes ──────────────────────────────────────────────────────────
router.get(stylistWallet_routes_1.STYLIST_WALLET_ROUTES.STYLIST.MY_WALLET, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.STYLIST]), controller.getStylistWallet.bind(controller));
// ─── Admin Routes ─────────────────────────────────────────────────────────────
router.get(stylistWallet_routes_1.STYLIST_WALLET_ROUTES.ADMIN.STYLIST_WALLET, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.ADMIN]), (0, validation_middleware_1.validate)({ params: stylistWallet_schema_1.GetStylistWalletSchema }), controller.getWalletByStylistId.bind(controller));
exports.default = router;
