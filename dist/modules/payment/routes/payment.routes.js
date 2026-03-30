"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const auth_middleware_1 = require("../../../common/middleware/auth.middleware");
const role_middleware_1 = require("../../../common/middleware/role.middleware");
const userRole_enum_1 = require("../../../common/enums/userRole.enum");
const payment_routes_1 = require("../constants/payment.routes");
const validation_middleware_1 = require("../../../common/middleware/validation.middleware");
const payment_schema_1 = require("../dto/payment.schema");
const router = (0, express_1.Router)();
const controller = (0, index_1.resolvePaymentController)();
router.use(auth_middleware_1.authMiddleware);
// User routes
router.post(payment_routes_1.API_ROUTES.USER.CREATE_ORDER, (0, validation_middleware_1.validate)({ body: payment_schema_1.CreateOrderSchema }), controller.createOrder);
router.post(payment_routes_1.API_ROUTES.USER.VERIFY, (0, validation_middleware_1.validate)({ body: payment_schema_1.PaymentVerificationSchema }), controller.verifyPayment);
router.post(payment_routes_1.API_ROUTES.USER.PAY_WITH_WALLET, (0, validation_middleware_1.validate)({ body: payment_schema_1.PayWithWalletSchema }), controller.payWithWallet);
router.post(payment_routes_1.API_ROUTES.USER.PAY_REMAINING_ORDER, (0, validation_middleware_1.validate)({ body: payment_schema_1.CreateRemainingOrderSchema }), controller.createRemainingOrder);
router.post(payment_routes_1.API_ROUTES.USER.PAY_REMAINING_WALLET, (0, validation_middleware_1.validate)({ body: payment_schema_1.PayRemainingWithWalletSchema }), controller.payRemainingWithWallet);
// Admin routes
router.get(payment_routes_1.API_ROUTES.ADMIN.BASE, (0, role_middleware_1.roleMiddleware)([userRole_enum_1.UserRole.ADMIN]), controller.getPaymentById);
exports.default = router;
