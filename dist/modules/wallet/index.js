"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveWalletController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../common/di/tokens");
const wallet_repository_1 = require("./repository/wallet.repository");
const walletTransaction_repository_1 = require("./repository/walletTransaction.repository");
const wallet_service_1 = require("./service/wallet.service");
const wallet_controller_1 = require("./controller/wallet.controller");
const payment_repository_1 = require("../payment/repository/payment.repository");
const razorpay_service_1 = require("../payment/service/razorpay.service");
// Register Repositories
tsyringe_1.container.register(tokens_1.TOKENS.WalletRepository, { useClass: wallet_repository_1.WalletRepository });
tsyringe_1.container.register(tokens_1.TOKENS.WalletTransactionRepository, { useClass: walletTransaction_repository_1.WalletTransactionRepository });
// Ensure RazorpayService + PaymentRepository are registered (needed by WalletService for topup)
if (!tsyringe_1.container.isRegistered(tokens_1.TOKENS.PaymentRepository)) {
    tsyringe_1.container.registerSingleton(tokens_1.TOKENS.PaymentRepository, payment_repository_1.PaymentRepository);
}
if (!tsyringe_1.container.isRegistered(tokens_1.TOKENS.RazorpayService)) {
    tsyringe_1.container.registerSingleton(tokens_1.TOKENS.RazorpayService, razorpay_service_1.RazorpayService);
}
// Register Services
tsyringe_1.container.register(tokens_1.TOKENS.WalletService, { useClass: wallet_service_1.WalletService });
// Register Controllers
tsyringe_1.container.register(tokens_1.TOKENS.WalletController, { useClass: wallet_controller_1.WalletController });
const resolveWalletController = () => tsyringe_1.container.resolve(tokens_1.TOKENS.WalletController);
exports.resolveWalletController = resolveWalletController;
