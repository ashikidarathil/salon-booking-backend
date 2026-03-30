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
exports.BranchServiceController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const apiResponse_1 = require("../../../common/response/apiResponse");
const branchService_messages_1 = require("../constants/branchService.messages");
let BranchServiceController = class BranchServiceController {
    constructor(_service) {
        this._service = _service;
        this.list = async (req, res) => {
            const data = await this._service.list(req.params.branchId);
            return apiResponse_1.ApiResponse.success(res, data, branchService_messages_1.BRANCH_SERVICE_MESSAGES.LISTED);
        };
        this.upsert = async (req, res) => {
            const data = await this._service.upsert(req.params.branchId, req.params.serviceId, {
                price: Number(req.body.price),
                duration: Number(req.body.duration),
                isActive: req.body.isActive === undefined ? undefined : Boolean(req.body.isActive),
            }, req.auth.userId);
            return apiResponse_1.ApiResponse.success(res, data, branchService_messages_1.BRANCH_SERVICE_MESSAGES.UPSERTED);
        };
        this.toggleStatus = async (req, res) => {
            const data = await this._service.toggleStatus(req.params.branchId, req.params.serviceId, { isActive: Boolean(req.body.isActive) }, req.auth.userId);
            return apiResponse_1.ApiResponse.success(res, data, branchService_messages_1.BRANCH_SERVICE_MESSAGES.STATUS_UPDATED);
        };
        this.listPaginated = async (req, res) => {
            const query = {
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 10,
                search: typeof req.query.search === 'string' ? req.query.search : undefined,
                sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt',
                sortOrder: req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'
                    ? req.query.sortOrder
                    : 'desc',
                ...(typeof req.query.configured === 'string' && {
                    configured: req.query.configured === 'true',
                }),
                ...(typeof req.query.isActive === 'string' && {
                    isActive: req.query.isActive === 'true',
                }),
            };
            const data = await this._service.listPaginated(req.params.branchId, query);
            return apiResponse_1.ApiResponse.success(res, data, branchService_messages_1.BRANCH_SERVICE_MESSAGES.LISTED);
        };
        this.listPaginatedPublic = async (req, res) => {
            const query = {
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 9,
                search: typeof req.query.search === 'string' ? req.query.search : undefined,
                sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt',
                sortOrder: req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'
                    ? req.query.sortOrder
                    : 'desc',
                ...(typeof req.query.categoryId === 'string' && {
                    categoryId: req.query.categoryId,
                }),
            };
            const data = await this._service.listPaginatedPublic(req.params.branchId, query);
            return apiResponse_1.ApiResponse.success(res, data, branchService_messages_1.BRANCH_SERVICE_MESSAGES.LISTED);
        };
        this.getDetailsPublic = async (req, res) => {
            const data = await this._service.getDetailsPublic(req.params.branchId, req.params.serviceId);
            return apiResponse_1.ApiResponse.success(res, data, branchService_messages_1.BRANCH_SERVICE_MESSAGES.DETAILS_FETCHED);
        };
    }
};
exports.BranchServiceController = BranchServiceController;
exports.BranchServiceController = BranchServiceController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.BranchServiceService)),
    __metadata("design:paramtypes", [Object])
], BranchServiceController);
