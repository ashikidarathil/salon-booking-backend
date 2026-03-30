"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
const cookie_util_1 = require("../../../common/utils/cookie.util");
const env_1 = require("../../../config/env");
const messages_1 = require("../../../common/constants/messages");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const userRole_enum_1 = require("../../../common/enums/userRole.enum");
const google_auth_library_1 = require("google-auth-library");
const user_mapper_1 = require("../mapper/user.mapper");
const otp_constants_1 = require("../constants/otp.constants");
const emailTemplates_1 = require("../../../common/service/email/emailTemplates");
const googleClient = new google_auth_library_1.OAuth2Client(env_1.env.GOOGLE_CLIENT_ID);
let AuthService = class AuthService {
    constructor(_userRepo, _otpService, _smsService, _emailService, _stylistRepo, _stylistBranchRepo) {
        this._userRepo = _userRepo;
        this._otpService = _otpService;
        this._smsService = _smsService;
        this._emailService = _emailService;
        this._stylistRepo = _stylistRepo;
        this._stylistBranchRepo = _stylistBranchRepo;
    }
    async enrichStylistData(user, safeUser) {
        if (user.role === userRole_enum_1.UserRole.STYLIST) {
            const stylist = await this._stylistRepo.findByUserId(user.id);
            if (stylist) {
                safeUser.bio = stylist.bio;
                const branchAssignment = await this._stylistBranchRepo.findActiveByStylistId(stylist.id);
                if (branchAssignment) {
                    safeUser.branchId = branchAssignment.branchId.toString();
                }
            }
        }
    }
    /**
     *
     * @param SignupDto
     * @returns SignupResponseDto
     */
    async signup(dto) {
        const name = dto.name.trim();
        const email = dto.email ? dto.email.toLowerCase().trim() : undefined;
        const phone = dto.phone ? dto.phone.trim() : undefined;
        if (!email && !phone) {
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.EMAIL_OR_PHONE_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (email) {
            const existingEmail = await this._userRepo.findByEmail(email);
            if (existingEmail)
                throw new appError_1.AppError(messages_1.MESSAGES.AUTH.EMAIL_EXISTS, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (phone) {
            const existingPhone = await this._userRepo.findByPhone(phone);
            if (existingPhone)
                throw new appError_1.AppError(messages_1.MESSAGES.AUTH.PHONE_EXISTS, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const hashed = await bcrypt_1.default.hash(dto.password, 10);
        const user = await this._userRepo.createUser({
            name,
            email,
            phone,
            password: hashed,
            role: userRole_enum_1.UserRole.USER,
            isActive: false,
            status: 'ACTIVE',
            emailVerified: false,
            phoneVerified: false,
        });
        if (email && !phone) {
            const otp = await this._otpService.generate(otp_constants_1.otpKey.signupEmail(email), otp_constants_1.OTP_TTL.SIGNUP_EMAIL);
            const template = (0, emailTemplates_1.otpEmailTemplate)(otp);
            await this._emailService.sendEmail({
                to: email,
                subject: template.subject,
                html: template.html,
            });
            return {
                message: messages_1.MESSAGES.AUTH.SIGNUP_EMAIL_SUCCESS,
                userId: user.id.toString(),
            };
        }
        if (phone && !email) {
            const otp = await this._otpService.generate(otp_constants_1.otpKey.signupSms(phone), otp_constants_1.OTP_TTL.SIGNUP_SMS);
            await this._smsService.sendSms({
                to: phone,
                message: `Your OTP is ${otp}. Valid for 5 minutes.`,
            });
            return {
                message: messages_1.MESSAGES.AUTH.SIGNUP_PHONE_SUCCESS,
                userId: user.id.toString(),
            };
        }
        throw new appError_1.AppError(messages_1.MESSAGES.AUTH.INVALID_CREDENTIALS, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
    }
    /**
     *
     * @param VerifyOtpDto
     * @returns VerifyOtpResponseDto
     */
    async verifyOtp(dto) {
        const email = dto.email.toLowerCase().trim();
        await this._otpService.verify(otp_constants_1.otpKey.signupEmail(email), dto.otp);
        const user = await this._userRepo.markEmailVerified(email);
        if (!user)
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.USER_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        return { success: true, message: messages_1.MESSAGES.AUTH.OTP_VERIFIED };
    }
    /**
     *
     * @param email
     * @returns
     */
    async resendEmailOtp(email) {
        const normalized = email.toLowerCase().trim();
        const user = await this._userRepo.findByEmail(normalized);
        if (!user)
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.EMAIL_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        await this._otpService.generate(otp_constants_1.otpKey.signupEmail(normalized), otp_constants_1.OTP_TTL.SIGNUP_EMAIL);
        return { success: true };
    }
    /**
     *
     * @param SendSmsOtpDto
     * @returns
     */
    async sendSmsOtp(dto) {
        const phone = dto.phone.trim();
        const otp = await this._otpService.generate(otp_constants_1.otpKey.signupSms(phone), otp_constants_1.OTP_TTL.SIGNUP_SMS);
        await this._smsService.sendSms({
            to: phone,
            message: `Your OTP is ${otp}. Valid for 5 minutes.`,
        });
        return { message: messages_1.MESSAGES.AUTH.OTP_SENT_TO_MOBILE };
    }
    /**
     *
     * @param VerifySignupSmsOtpDto
     * @returns
     */
    async verifySignupSmsOtp(dto) {
        const phone = dto.phone.trim();
        await this._otpService.verify(otp_constants_1.otpKey.signupSms(phone), dto.otp);
        const user = await this._userRepo.markPhoneVerifiedByPhone(phone);
        if (!user) {
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.USER_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        return { success: true };
    }
    /**
     *
     * @param phone
     * @returns
     */
    async resendSmsOtp(phone) {
        const normalized = phone.trim();
        const user = await this._userRepo.findByPhone(normalized);
        if (!user)
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.PHONE_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        const otp = await this._otpService.generate(otp_constants_1.otpKey.signupSms(normalized), otp_constants_1.OTP_TTL.SIGNUP_SMS);
        await this._smsService.sendSms({
            to: normalized,
            message: `Your OTP is ${otp}. Valid for 5 minutes.`,
        });
        return { success: true };
    }
    /* ========================== LOGIN & SESSION ========================== */
    /**
     *
     * @param dto
     * @param tabId
     * @returns LoginResponseDto
     */
    async login(dto, tabId) {
        const identifier = dto.identifier.trim();
        const user = await this._userRepo.findByEmailOrPhone(identifier);
        if (!user)
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.INVALID_CREDENTIALS, httpStatus_enum_1.HttpStatus.UNAUTHORIZED);
        if (user.role !== dto.role) {
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.UNAUTHORIZED_ROLE_ACCESS, httpStatus_enum_1.HttpStatus.FORBIDDEN);
        }
        if (!user.password)
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.INVALID_CREDENTIALS, httpStatus_enum_1.HttpStatus.UNAUTHORIZED);
        if (user.authProvider === 'GOOGLE') {
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.USE_GOOGLE_LOGIN, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (user.isBlocked) {
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.USER_BLOCKED, httpStatus_enum_1.HttpStatus.FORBIDDEN);
        }
        if (!user.isActive) {
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.VERIFY_EMAIL_OR_PHONE, httpStatus_enum_1.HttpStatus.FORBIDDEN);
        }
        const ok = await bcrypt_1.default.compare(dto.password, user.password);
        if (!ok)
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.INVALID_CREDENTIALS, httpStatus_enum_1.HttpStatus.UNAUTHORIZED);
        const tokens = (0, cookie_util_1.createAuthTokens)(user.id, user.role, tabId);
        const safeUser = user_mapper_1.UserMapper.toSafeUser(user);
        await this.enrichStylistData(user, safeUser);
        return {
            user: safeUser,
            tokens,
        };
    }
    /**
     *
     * @param GoogleLoginDto
     * @param tabId
     * @returns LoginResponseDto
     */
    async googleLogin(dto, tabId) {
        const ticket = await googleClient.verifyIdToken({
            idToken: dto.idToken,
            audience: env_1.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload?.email || !payload.sub) {
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.INVALID_GOOGLE_TOKEN, httpStatus_enum_1.HttpStatus.UNAUTHORIZED);
        }
        const email = payload.email.toLowerCase().trim();
        let user = await this._userRepo.findByEmail(email);
        if (user?.isBlocked) {
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.USER_BLOCKED, httpStatus_enum_1.HttpStatus.FORBIDDEN);
        }
        if (!user) {
            user = await this._userRepo.createGoogleUser({
                name: payload.name || 'Google User',
                email,
                googleId: payload.sub,
            });
        }
        if (user?.role !== userRole_enum_1.UserRole.USER) {
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.GOOGLE_LOGIN_ONLY_FOR_USERS, httpStatus_enum_1.HttpStatus.FORBIDDEN);
        }
        const tokens = (0, cookie_util_1.createAuthTokens)(user.id, user.role, tabId);
        return {
            user: user_mapper_1.UserMapper.toSafeUser(user),
            tokens,
        };
    }
    /**
     *
     * @param refreshToken
     * @param tabId
     * @returns LoginResponseDto
     */
    async refresh(refreshToken, tabId) {
        if (!refreshToken) {
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.NO_TOKEN, httpStatus_enum_1.HttpStatus.UNAUTHORIZED);
        }
        const decoded = jwt.verify(refreshToken, env_1.env.REFRESH_TOKEN_SECRET);
        const user = await this._userRepo.findById(decoded.userId);
        if (!user)
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.USER_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        if (user.isBlocked) {
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.USER_BLOCKED, httpStatus_enum_1.HttpStatus.FORBIDDEN);
        }
        const tokens = (0, cookie_util_1.createAuthTokens)(user.id, user.role, tabId);
        const safeUser = user_mapper_1.UserMapper.toSafeUser(user);
        await this.enrichStylistData(user, safeUser);
        return {
            user: safeUser,
            tokens,
        };
    }
    /**
     *
     * @param userId
     * @returns MeResponseDto
     */
    async me(userId) {
        const user = await this._userRepo.findById(userId);
        if (!user)
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.USER_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        if (user.isBlocked) {
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.USER_BLOCKED, httpStatus_enum_1.HttpStatus.FORBIDDEN);
        }
        if (!user.isActive) {
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.VERIFY_EMAIL_OR_PHONE, httpStatus_enum_1.HttpStatus.FORBIDDEN);
        }
        const safeUser = user_mapper_1.UserMapper.toSafeUser(user);
        await this.enrichStylistData(user, safeUser);
        return { user: safeUser };
    }
    /* ========================== PASSWORD ========================== */
    /**
     *
     * @param ForgotPasswordDto
     * @returns ForgotPasswordResponseDto
     */
    async forgotPassword(dto) {
        const email = dto.email.toLowerCase().trim();
        const user = await this._userRepo.findByEmail(email);
        if (!user)
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.USER_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        const otp = await this._otpService.generate(otp_constants_1.otpKey.resetPassword(email), otp_constants_1.OTP_TTL.RESET_PASSWORD);
        console.log(`Password reset token for ${email}: ${otp}`);
        const template = (0, emailTemplates_1.otpEmailTemplate)(otp);
        await this._emailService.sendEmail({
            to: email,
            subject: template.subject,
            html: template.html,
        });
        return { message: messages_1.MESSAGES.AUTH.RESET_OTP_SENT };
    }
    /**
     *
     * @param email
     * @returns
     */
    async resendResetOtp(email) {
        const normalized = email.toLowerCase().trim();
        const user = await this._userRepo.findByEmail(normalized);
        if (!user)
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.EMAIL_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        const otp = await this._otpService.generate(otp_constants_1.otpKey.resetPassword(normalized), otp_constants_1.OTP_TTL.RESET_PASSWORD);
        console.log(`Reset OTP for ${normalized}: ${otp}`);
        const template = (0, emailTemplates_1.otpEmailTemplate)(otp);
        await this._emailService.sendEmail({
            to: normalized,
            subject: template.subject,
            html: template.html,
        });
        return { success: true };
    }
    /**
     *
     * @param email
     * @param otp
     * @returns
     */
    async verifyResetOtp(email, otp) {
        const normalized = email.toLowerCase().trim();
        await this._otpService.verify(otp_constants_1.otpKey.resetPassword(normalized), otp);
        return { success: true };
    }
    async resetPassword(dto) {
        const email = dto.email.toLowerCase().trim();
        const hashed = await bcrypt_1.default.hash(dto.newPassword, 10);
        const user = await this._userRepo.updatePassword(email, hashed);
        if (!user)
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.USER_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        return { success: true, message: messages_1.MESSAGES.AUTH.RESET_OK };
    }
    /* ========================== STYLIST ========================== */
    /**
     *
     * @param ApplyAsStylistDto
     * @returns ApplyAsStylistResponseDto
     */
    async applyAsStylist(dto) {
        const { name, email, phone, specialization, experience } = dto;
        if (!email && !phone) {
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.EMAIL_OR_PHONE_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (!specialization?.trim()) {
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.SPECIALIZATION_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (!experience) {
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.EXPERIENCE_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (email) {
            const normalizedEmail = email.toLowerCase().trim();
            const existing = await this._userRepo.findByEmail(normalizedEmail);
            if (existing) {
                throw new appError_1.AppError(messages_1.MESSAGES.AUTH.EMAIL_EXISTS, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
            }
        }
        if (phone) {
            const normalizedPhone = phone.trim();
            const existing = await this._userRepo.findByPhone(normalizedPhone);
            if (existing) {
                throw new appError_1.AppError(messages_1.MESSAGES.AUTH.PHONE_EXISTS, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
            }
        }
        const user = await this._userRepo.createUser({
            name: name?.trim() || email?.split('@')[0] || 'Stylist',
            email: email?.toLowerCase().trim(),
            phone: phone?.trim(),
            role: userRole_enum_1.UserRole.STYLIST,
            isActive: false,
            status: 'APPLIED',
            emailVerified: false,
            phoneVerified: false,
        });
        await this._stylistRepo.createStylistDraft({
            userId: user.id,
            specialization: specialization.trim(),
            experience,
        });
        return {
            message: messages_1.MESSAGES.AUTH.STYLIST_APPLICATION_SUCCESS,
            userId: user.id,
        };
    }
    async getUsers(query) {
        return this._userRepo.getPaginated(query);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.UserRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.OtpService)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.SmsService)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.EmailService)),
    __param(4, (0, tsyringe_1.inject)(tokens_1.TOKENS.StylistRepository)),
    __param(5, (0, tsyringe_1.inject)(tokens_1.TOKENS.StylistBranchRepository)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], AuthService);
