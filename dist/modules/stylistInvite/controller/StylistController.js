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
exports.StylistController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const apiResponse_1 = require("../../../common/response/apiResponse");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const stylistInvite_messages_1 = require("../constants/stylistInvite.messages");
let StylistController = class StylistController {
    constructor(_service) {
        this._service = _service;
    }
    async list(req, res) {
        const data = await this._service.listAllWithInviteStatus();
        return apiResponse_1.ApiResponse.success(res, data, stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.STYLISTS_LISTED);
    }
    async getStylists(req, res) {
        const result = await this._service.getPaginatedStylists(req.query);
        return apiResponse_1.ApiResponse.success(res, result, stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.STYLISTS_LISTED);
    }
    async toggleBlock(req, res) {
        const stylistId = req.params.stylistId;
        if (typeof req.body.isBlocked !== 'boolean') {
            return apiResponse_1.ApiResponse.error(res, stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.IS_BLOCKED_BOOLEAN, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const result = await this._service.toggleBlockStylist(stylistId, req.body.isBlocked);
        if (!result) {
            return apiResponse_1.ApiResponse.error(res, stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.STYLIST_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        const message = req.body.isBlocked
            ? stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.STYLIST_BLOCKED
            : stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.STYLIST_UNBLOCKED;
        return apiResponse_1.ApiResponse.success(res, { success: true }, message);
    }
    async updatePosition(req, res) {
        const stylistId = req.params.stylistId;
        const { position } = req.body;
        if (!['JUNIOR', 'SENIOR', 'TRAINEE'].includes(position)) {
            return apiResponse_1.ApiResponse.error(res, stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.INVALID_POSITION, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const result = await this._service.updateStylistPosition(stylistId, position);
        if (!result) {
            return apiResponse_1.ApiResponse.error(res, stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.STYLIST_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        return apiResponse_1.ApiResponse.success(res, result, stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.POSITION_UPDATED);
    }
    async getPublicStylists(req, res) {
        const result = await this._service.getPublicStylists(req.query, req.auth?.userId);
        return apiResponse_1.ApiResponse.success(res, result, stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.STYLISTS_LISTED);
    }
    async getPublicStylistById(req, res) {
        const stylistId = req.params.stylistId;
        const result = await this._service.getPublicStylistById(stylistId, req.auth?.userId);
        if (!result) {
            return apiResponse_1.ApiResponse.error(res, stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.STYLIST_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        return apiResponse_1.ApiResponse.success(res, result, stylistInvite_messages_1.STYLIST_INVITE_MESSAGES.STYLIST_FETCHED);
    }
};
exports.StylistController = StylistController;
exports.StylistController = StylistController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.StylistManagementService)),
    __metadata("design:paramtypes", [Object])
], StylistController);
