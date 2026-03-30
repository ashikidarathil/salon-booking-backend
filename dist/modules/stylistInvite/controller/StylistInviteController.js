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
exports.StylistInviteController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const apiResponse_1 = require("../../../common/response/apiResponse");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const stylistInvite_messages_1 = require("../constants/stylistInvite.messages");
let StylistInviteController = class StylistInviteController {
    constructor(_service) {
        this._service = _service;
    }
    getTabId(req) {
        return req.headers['x-tab-id'] || '';
    }
    adminId(req) {
        return req.auth?.userId ?? '';
    }
    async createInvite(req, res) {
        const adminId = this.adminId(req);
        const dto = {
            email: String(req.body.email || ''),
            specialization: String(req.body.specialization || ''),
            experience: Number(req.body.experience || 0),
        };
        const data = await this._service.createInvite(adminId, dto);
        return apiResponse_1.ApiResponse.success(res, data, stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.INVITE_CREATED, httpStatus_enum_1.HttpStatus.CREATED);
    }
    async validate(req, res) {
        const dto = { token: String(req.params.token || '') };
        const data = await this._service.validateInvite(dto);
        return apiResponse_1.ApiResponse.success(res, data, stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.INVITE_VALID);
    }
    async accept(req, res) {
        const tabId = this.getTabId(req);
        const dto = {
            token: String(req.params.token || ''),
            name: String(req.body.name || ''),
            phone: req.body.phone ? String(req.body.phone) : undefined,
            password: String(req.body.password || ''),
        };
        const data = await this._service.acceptInvite(dto, tabId);
        return apiResponse_1.ApiResponse.success(res, data, stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.INVITE_ACCEPTED);
    }
    async approve(req, res) {
        const adminId = this.adminId(req);
        const userId = String(req.params.userId || '');
        const data = await this._service.approveStylist(adminId, userId);
        return apiResponse_1.ApiResponse.success(res, data, stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.STYLIST_APPROVED);
    }
    async reject(req, res) {
        const adminId = this.adminId(req);
        const userId = String(req.params.userId || '');
        const data = await this._service.rejectStylist(adminId, userId);
        return apiResponse_1.ApiResponse.success(res, data, stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.STYLIST_REJECTED);
    }
    async toggleBlock(req, res) {
        const adminId = this.adminId(req);
        const userId = String(req.params.userId || '');
        const block = Boolean(req.body.block);
        const data = await this._service.toggleBlock(adminId, userId, block);
        return apiResponse_1.ApiResponse.success(res, data, block ? stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.USER_BLOCKED : stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.USER_UNBLOCKED);
    }
    async sendInviteToApplied(req, res) {
        const adminId = this.adminId(req);
        const userId = String(req.params.userId || '');
        const data = await this._service.sendInviteToAppliedStylist(adminId, userId);
        return apiResponse_1.ApiResponse.success(res, data, stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.INVITE_SENT);
    }
};
exports.StylistInviteController = StylistInviteController;
exports.StylistInviteController = StylistInviteController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.StylistInviteService)),
    __metadata("design:paramtypes", [Object])
], StylistInviteController);
