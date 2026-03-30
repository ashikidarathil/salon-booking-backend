"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveStylistController = exports.resolveStylistInviteController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../common/di/tokens");
const StylistInviteRepository_1 = require("./repository/StylistInviteRepository");
const StylistRepository_1 = require("./repository/StylistRepository");
const StylistInviteService_1 = require("./service/StylistInviteService");
const EmailService_1 = require("../../common/service/email/EmailService");
const StylistService_1 = require("./service/StylistService");
const StylistInviteController_1 = require("./controller/StylistInviteController");
const StylistController_1 = require("./controller/StylistController");
tsyringe_1.container.register(tokens_1.TOKENS.StylistInviteRepository, {
    useClass: StylistInviteRepository_1.StylistInviteRepository,
});
tsyringe_1.container.register(tokens_1.TOKENS.StylistRepository, {
    useClass: StylistRepository_1.StylistRepository,
});
tsyringe_1.container.register(tokens_1.TOKENS.EmailService, {
    useClass: EmailService_1.EmailService,
});
tsyringe_1.container.register(tokens_1.TOKENS.StylistInviteService, {
    useClass: StylistInviteService_1.StylistInviteService,
});
tsyringe_1.container.register(tokens_1.TOKENS.StylistManagementService, {
    useClass: StylistService_1.StylistService,
});
tsyringe_1.container.register(StylistInviteController_1.StylistInviteController, {
    useClass: StylistInviteController_1.StylistInviteController,
});
tsyringe_1.container.register(StylistController_1.StylistController, {
    useClass: StylistController_1.StylistController,
});
const resolveStylistInviteController = () => tsyringe_1.container.resolve(StylistInviteController_1.StylistInviteController);
exports.resolveStylistInviteController = resolveStylistInviteController;
const resolveStylistController = () => tsyringe_1.container.resolve(StylistController_1.StylistController);
exports.resolveStylistController = resolveStylistController;
