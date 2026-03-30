"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const apiResponse_1 = require("../../../common/response/apiResponse");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const messages_1 = require("../../../common/constants/messages");
const appError_1 = require("../../../common/errors/appError");
const cookie_util_1 = require("../../../common/utils/cookie.util");
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
let AuthController = class AuthController {
    constructor(_authService, _profileService) {
        this._authService = _authService;
        this._profileService = _profileService;
    }
    getTabId(req) {
        return req.headers['x-tab-id'] || '';
    }
    async handleProfileUpload(req) {
        const userId = req.auth?.userId;
        if (!userId) {
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.AUTH_REQUIRED, httpStatus_enum_1.HttpStatus.UNAUTHORIZED);
        }
        return this._profileService.uploadProfilePicture({
            userId,
            file: req.file,
        });
    }
    async signup(req, res) {
        const dto = req.body;
        const data = await this._authService.signup(dto);
        res.status(httpStatus_enum_1.HttpStatus.CREATED).json(new apiResponse_1.ApiResponse(true, messages_1.MESSAGES.AUTH.SIGNUP_SUCCESS, data));
    }
    async verifyOtp(req, res) {
        const dto = req.body;
        const data = await this._authService.verifyOtp(dto);
        res.status(httpStatus_enum_1.HttpStatus.OK).json(new apiResponse_1.ApiResponse(true, messages_1.MESSAGES.AUTH.OTP_VERIFIED, data));
    }
    async sendSmsOtp(req, res) {
        const dto = req.body;
        const data = await this._authService.sendSmsOtp(dto);
        res.json(new apiResponse_1.ApiResponse(true, messages_1.MESSAGES.AUTH.SMS_OTP_SENT, data));
    }
    async verifySignupSmsOtp(req, res) {
        const dto = req.body;
        await this._authService.verifySignupSmsOtp(dto);
        res.status(httpStatus_enum_1.HttpStatus.OK).json(new apiResponse_1.ApiResponse(true, messages_1.MESSAGES.AUTH.PHONE_VERIFIED));
    }
    async resendEmailOtp(req, res) {
        const { email } = req.body;
        await this._authService.resendEmailOtp(email);
        res.json(new apiResponse_1.ApiResponse(true, messages_1.MESSAGES.AUTH.EMAIL_OTP_SENT));
    }
    async resendSmsOtp(req, res) {
        const { phone } = req.body;
        await this._authService.resendSmsOtp(phone);
        res.json(new apiResponse_1.ApiResponse(true, messages_1.MESSAGES.AUTH.SMS_OTP_RESENT));
    }
    async login(req, res) {
        const dto = req.body;
        const tabId = this.getTabId(req);
        const data = await this._authService.login(dto, tabId);
        (0, cookie_util_1.setAuthCookies)(res, data.user.role, data.tokens);
        res
            .status(httpStatus_enum_1.HttpStatus.OK)
            .json(new apiResponse_1.ApiResponse(true, messages_1.MESSAGES.AUTH.LOGIN_SUCCESS, { user: data.user }));
    }
    async googleLogin(req, res) {
        const dto = req.body;
        const tabId = this.getTabId(req);
        const data = await this._authService.googleLogin(dto, tabId);
        (0, cookie_util_1.setAuthCookies)(res, data.user.role, data.tokens);
        res
            .status(httpStatus_enum_1.HttpStatus.OK)
            .json(new apiResponse_1.ApiResponse(true, messages_1.MESSAGES.AUTH.GOOGLE_LOGIN_SUCCESS, { user: data.user }));
    }
    async forgotPassword(req, res) {
        const dto = req.body;
        const data = await this._authService.forgotPassword(dto);
        res.status(httpStatus_enum_1.HttpStatus.OK).json(new apiResponse_1.ApiResponse(true, messages_1.MESSAGES.AUTH.RESET_OTP_SENT, data));
    }
    async resendResetOtp(req, res) {
        const { email } = req.body;
        await this._authService.resendResetOtp(email.trim().toLowerCase());
        res.json(new apiResponse_1.ApiResponse(true, messages_1.MESSAGES.AUTH.RESET_OTP_RESENT));
    }
    async verifyResetOtp(req, res) {
        const { email, otp } = req.body;
        await this._authService.verifyResetOtp(email.trim().toLowerCase(), otp);
        res.json(new apiResponse_1.ApiResponse(true, messages_1.MESSAGES.AUTH.RESET_OTP_VERIFIED));
    }
    async resetPassword(req, res) {
        const dto = req.body;
        const data = await this._authService.resetPassword(dto);
        res.status(httpStatus_enum_1.HttpStatus.OK).json(new apiResponse_1.ApiResponse(true, messages_1.MESSAGES.AUTH.RESET_OK, data));
    }
    async refresh(req, res) {
        const roleHeader = req.headers['x-auth-role']?.toUpperCase();
        const token = req.cookies?.[`${roleHeader?.toLowerCase()}_refresh_token`];
        const tabId = this.getTabId(req);
        const data = await this._authService.refresh(token, tabId);
        (0, cookie_util_1.setAuthCookies)(res, data.user.role, data.tokens);
        res
            .status(httpStatus_enum_1.HttpStatus.OK)
            .json(new apiResponse_1.ApiResponse(true, messages_1.MESSAGES.AUTH.TOKEN_REFRESHED, { user: data.user }));
    }
    async me(req, res) {
        if (!req.auth?.userId) {
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.AUTH_REQUIRED, httpStatus_enum_1.HttpStatus.UNAUTHORIZED);
        }
        const data = await this._authService.me(req.auth.userId);
        res.status(httpStatus_enum_1.HttpStatus.OK).json(new apiResponse_1.ApiResponse(true, messages_1.MESSAGES.AUTH.ME_SUCCESS, data));
    }
    async logout(req, res) {
        const roleHeader = req.headers['x-auth-role']?.toUpperCase();
        (0, cookie_util_1.clearAuthCookies)(res, roleHeader);
        res
            .status(httpStatus_enum_1.HttpStatus.OK)
            .json(new apiResponse_1.ApiResponse(true, messages_1.MESSAGES.AUTH.LOGOUT_SUCCESS || 'Logged out'));
    }
    async applyAsStylist(req, res) {
        const dto = req.body;
        const data = await this._authService.applyAsStylist(dto);
        res
            .status(httpStatus_enum_1.HttpStatus.CREATED)
            .json(new apiResponse_1.ApiResponse(true, messages_1.MESSAGES.AUTH.STYLIST_APPLICATION_SUBMITTED, data));
    }
    async uploadProfilePicture(req, res) {
        const data = await this.handleProfileUpload(req);
        res
            .status(httpStatus_enum_1.HttpStatus.OK)
            .json(new apiResponse_1.ApiResponse(true, messages_1.MESSAGES.AUTH.PROFILE_PICTURE_UPLOAD_SUCCESS, data));
    }
    async updateProfilePicture(req, res) {
        const data = await this.handleProfileUpload(req);
        res
            .status(httpStatus_enum_1.HttpStatus.OK)
            .json(new apiResponse_1.ApiResponse(true, messages_1.MESSAGES.AUTH.PROFILE_PICTURE_UPDATE_SUCCESS, data));
    }
    async changePassword(req, res) {
        const userId = req.auth?.userId;
        if (!userId) {
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.AUTH_REQUIRED, httpStatus_enum_1.HttpStatus.UNAUTHORIZED);
        }
        const data = await this._profileService.changePassword(userId, req.body);
        res.status(httpStatus_enum_1.HttpStatus.OK).json(new apiResponse_1.ApiResponse(true, data.message, data));
    }
    async updateProfile(req, res) {
        const userId = req.auth?.userId;
        if (!userId) {
            throw new appError_1.AppError(messages_1.MESSAGES.AUTH.AUTH_REQUIRED, httpStatus_enum_1.HttpStatus.UNAUTHORIZED);
        }
        const data = await this._profileService.updateProfile(userId, req.body);
        res.status(httpStatus_enum_1.HttpStatus.OK).json(new apiResponse_1.ApiResponse(true, data.message, data));
    }
};
exports.AuthController = AuthController;
exports.AuthController = AuthController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.AuthService)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.ProfileService)),
    __metadata("design:paramtypes", [Object, Object])
], AuthController);
