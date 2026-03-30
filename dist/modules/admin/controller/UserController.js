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
exports.UserController = void 0;
const tsyringe_1 = require("tsyringe");
const apiResponse_1 = require("../../../common/response/apiResponse");
const tokens_1 = require("../../../common/di/tokens");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const messages_1 = require("../constants/messages");
const userRole_enum_1 = require("../../../common/enums/userRole.enum");
let UserController = class UserController {
    constructor(_adminService) {
        this._adminService = _adminService;
    }
    async getProfile(req, res) {
        const userId = req.auth?.userId;
        if (!userId) {
            throw new appError_1.AppError(messages_1.MESSAGES.ADMIN.UNAUTHORIZED, httpStatus_enum_1.HttpStatus.UNAUTHORIZED);
        }
        const admin = await this._adminService.getProfile(userId);
        return apiResponse_1.ApiResponse.success(res, admin, messages_1.MESSAGES.ADMIN.ADMIN_PROFILE_FETCHED_SUCCESSFULLY);
    }
    async getDashboardStats(req, res) {
        const stats = await this._adminService.getDashboardStats();
        return apiResponse_1.ApiResponse.success(res, stats, messages_1.MESSAGES.ADMIN.DASHBOARD_STATS_FETCHED);
    }
    async toggleBlock(req, res) {
        const userId = req.params.userId;
        const dto = req.body;
        await this._adminService.toggleBlockUser(userId, dto.isBlocked);
        const message = dto.isBlocked ? messages_1.MESSAGES.ADMIN.USER_BLOCKED : messages_1.MESSAGES.ADMIN.USER_UNBLOCKED;
        return apiResponse_1.ApiResponse.success(res, { success: true }, message);
    }
    async getUsers(req, res) {
        const query = {
            ...req.query,
            role: userRole_enum_1.UserRole.USER,
        };
        const result = await this._adminService.getUsers(query);
        return apiResponse_1.ApiResponse.success(res, result, messages_1.MESSAGES.ADMIN.USERS_RETRIEVED);
    }
};
exports.UserController = UserController;
exports.UserController = UserController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.UserAdminService)),
    __metadata("design:paramtypes", [Object])
], UserController);
