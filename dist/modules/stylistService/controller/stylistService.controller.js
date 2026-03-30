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
exports.StylistServiceController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const apiResponse_1 = require("../../../common/response/apiResponse");
const stylistService_messages_1 = require("../constants/stylistService.messages");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
let StylistServiceController = class StylistServiceController {
    constructor(_service) {
        this._service = _service;
        this.list = async (req, res) => {
            const { role, userId } = req.auth || {};
            const { branchId } = req.query;
            if (role === 'STYLIST' && userId !== req.params.stylistId) {
                return apiResponse_1.ApiResponse.error(res, stylistService_messages_1.STYLIST_SERVICE_MESSAGES.UNAUTHORIZED, httpStatus_enum_1.HttpStatus.FORBIDDEN);
            }
            const data = await this._service.list(req.params.stylistId, branchId);
            return apiResponse_1.ApiResponse.success(res, data, stylistService_messages_1.STYLIST_SERVICE_MESSAGES.LISTED);
        };
        this.toggleStatus = async (req, res) => {
            const adminId = req.auth?.userId;
            if (!adminId) {
                return apiResponse_1.ApiResponse.error(res, stylistService_messages_1.STYLIST_SERVICE_MESSAGES.UNAUTHORIZED, httpStatus_enum_1.HttpStatus.UNAUTHORIZED);
            }
            const data = await this._service.toggleStatus(req.params.stylistId, req.params.serviceId, req.body, adminId);
            return apiResponse_1.ApiResponse.success(res, data, stylistService_messages_1.STYLIST_SERVICE_MESSAGES.STATUS_UPDATED);
        };
        this.listPaginated = async (req, res) => {
            const query = req.query;
            const data = await this._service.listPaginated(req.params.stylistId, query);
            return apiResponse_1.ApiResponse.success(res, data, stylistService_messages_1.STYLIST_SERVICE_MESSAGES.LISTED);
        };
        this.getStylistsByService = async (req, res) => {
            const data = await this._service.getStylistsByService(req.params.serviceId);
            return apiResponse_1.ApiResponse.success(res, data, stylistService_messages_1.STYLIST_SERVICE_MESSAGES.LISTED);
        };
    }
};
exports.StylistServiceController = StylistServiceController;
exports.StylistServiceController = StylistServiceController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.StylistServiceService)),
    __metadata("design:paramtypes", [Object])
], StylistServiceController);
