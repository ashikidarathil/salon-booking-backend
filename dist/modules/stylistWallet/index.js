"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveStylistWalletController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../common/di/tokens");
const stylistWallet_repository_1 = require("./repository/stylistWallet.repository");
const stylistWallet_service_1 = require("./service/stylistWallet.service");
const stylistWallet_controller_1 = require("./controller/stylistWallet.controller");
// Repositories
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.StylistWalletRepository, stylistWallet_repository_1.StylistWalletRepository);
// Services
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.StylistWalletService, stylistWallet_service_1.StylistWalletService);
// Controllers
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.StylistWalletController, stylistWallet_controller_1.StylistWalletController);
const resolveStylistWalletController = () => tsyringe_1.container.resolve(tokens_1.TOKENS.StylistWalletController);
exports.resolveStylistWalletController = resolveStylistWalletController;
