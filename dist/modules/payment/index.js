"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvePaymentController = resolvePaymentController;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../common/di/tokens");
const payment_repository_1 = require("./repository/payment.repository");
const razorpay_service_1 = require("./service/razorpay.service");
const payment_service_1 = require("./service/payment.service");
const payment_controller_1 = require("./controller/payment.controller");
// Register Repositories
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.PaymentRepository, payment_repository_1.PaymentRepository);
// Register Services
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.RazorpayService, razorpay_service_1.RazorpayService);
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.PaymentService, payment_service_1.PaymentService);
// Register Controllers
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.PaymentController, payment_controller_1.PaymentController);
function resolvePaymentController() {
    return tsyringe_1.container.resolve(tokens_1.TOKENS.PaymentController);
}
