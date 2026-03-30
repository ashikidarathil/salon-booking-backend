"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAuthController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../common/di/tokens");
const UserRepository_1 = require("./repository/UserRepository");
const OtpService_1 = require("./service/OtpService");
const EmailService_1 = require("../../common/service/email/EmailService");
const AuthService_1 = require("./service/AuthService");
const AuthController_1 = require("./controller/AuthController");
const TwilioSmsService_1 = require("../../common/service/sms/TwilioSmsService");
const StylistRepository_1 = require("../stylistInvite/repository/StylistRepository");
const S3Service_1 = require("../../common/service/image/S3Service");
const ProfileService_1 = require("./service/ProfileService");
tsyringe_1.container.register(tokens_1.TOKENS.UserRepository, { useClass: UserRepository_1.UserRepository });
tsyringe_1.container.register(tokens_1.TOKENS.OtpService, { useClass: OtpService_1.RedisOtpService });
tsyringe_1.container.register(tokens_1.TOKENS.AuthService, { useClass: AuthService_1.AuthService });
tsyringe_1.container.register(tokens_1.TOKENS.EmailService, {
    useClass: EmailService_1.EmailService,
});
tsyringe_1.container.register(tokens_1.TOKENS.SmsService, {
    useClass: TwilioSmsService_1.TwilioSmsService,
});
tsyringe_1.container.register(tokens_1.TOKENS.StylistRepository, {
    useClass: StylistRepository_1.StylistRepository,
});
tsyringe_1.container.registerSingleton(tokens_1.TOKENS.ProfileService, ProfileService_1.ProfileService);
tsyringe_1.container.register(tokens_1.TOKENS.ImageService, {
    useClass: S3Service_1.S3Service,
});
tsyringe_1.container.register(AuthController_1.AuthController, { useClass: AuthController_1.AuthController });
const resolveAuthController = () => tsyringe_1.container.resolve(AuthController_1.AuthController);
exports.resolveAuthController = resolveAuthController;
