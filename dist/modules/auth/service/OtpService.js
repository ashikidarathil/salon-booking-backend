"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisOtpService = void 0;
const redis_1 = __importDefault(require("../../../config/redis"));
const tsyringe_1 = require("tsyringe");
const appError_1 = require("../../../common/errors/appError");
const messages_1 = require("../../../common/constants/messages");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
let RedisOtpService = class RedisOtpService {
    generateCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async generate(key, ttlSeconds) {
        const otp = this.generateCode();
        await redis_1.default.set(key, otp, { EX: ttlSeconds });
        return otp;
    }
    async resend(key, ttlSeconds) {
        return this.generate(key, ttlSeconds);
    }
    async verify(key, otp) {
        const storedOtp = await redis_1.default.get(key);
        if (!storedOtp || storedOtp !== otp) {
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.OTP_INVALID, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        await redis_1.default.del(key);
    }
};
exports.RedisOtpService = RedisOtpService;
exports.RedisOtpService = RedisOtpService = __decorate([
    (0, tsyringe_1.injectable)()
], RedisOtpService);
