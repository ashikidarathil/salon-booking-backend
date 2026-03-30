"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveWishlistController = resolveWishlistController;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../common/di/tokens");
const WishlistRepository_1 = require("./repository/WishlistRepository");
const WishlistService_1 = require("./service/WishlistService");
const WishlistController_1 = require("./controller/WishlistController");
// Repository
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.WishlistRepository, WishlistRepository_1.WishlistRepository);
// Service
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.WishlistService, WishlistService_1.WishlistService);
// Controller
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.WishlistController, WishlistController_1.WishlistController);
function resolveWishlistController() {
    return tsyringe_1.container.resolve(tokens_1.TOKENS.WishlistController);
}
