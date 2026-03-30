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
exports.ServiceController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const appError_1 = require("../../../common/errors/appError");
const apiResponse_1 = require("../../../common/response/apiResponse");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const service_messages_1 = require("../constants/service.messages");
let ServiceController = class ServiceController {
    constructor(_service) {
        this._service = _service;
    }
    async create(req, res) {
        const dto = {
            name: req.body.name,
            description: req.body.description,
            categoryId: req.body.categoryId,
            imageUrl: req.body.imageUrl,
            whatIncluded: req.body.whatIncluded,
        };
        const data = await this._service.create(dto);
        return apiResponse_1.ApiResponse.success(res, data, service_messages_1.MESSAGES.SERVICE.CREATED, httpStatus_enum_1.HttpStatus.CREATED);
    }
    async update(req, res) {
        const dto = {
            name: req.body.name,
            description: req.body.description,
            status: req.body.status,
            imageUrl: req.body.imageUrl,
            categoryId: req.body.categoryId,
            whatIncluded: req.body.whatIncluded,
        };
        const data = await this._service.update(req.params.id, dto);
        return apiResponse_1.ApiResponse.success(res, data, service_messages_1.MESSAGES.SERVICE.UPDATED);
    }
    async listAdmin(req, res) {
        const includeDeleted = req.query.includeDeleted === 'true';
        const data = await this._service.list(includeDeleted);
        return apiResponse_1.ApiResponse.success(res, data, service_messages_1.MESSAGES.SERVICE.LISTED);
    }
    async listPublic(_req, res) {
        const data = await this._service.list(false);
        const activeOnly = data.filter((s) => !s.isDeleted && s.status === 'ACTIVE');
        return apiResponse_1.ApiResponse.success(res, activeOnly, service_messages_1.MESSAGES.SERVICE.LISTED);
    }
    async softDelete(req, res) {
        const dto = {
            id: req.params.id,
        };
        const data = await this._service.softDelete(dto);
        return apiResponse_1.ApiResponse.success(res, data, service_messages_1.MESSAGES.SERVICE.DELETED);
    }
    async restore(req, res) {
        const dto = {
            id: req.params.id,
        };
        const data = await this._service.restore(dto);
        return apiResponse_1.ApiResponse.success(res, data, service_messages_1.MESSAGES.SERVICE.RESTORED);
    }
    async uploadImage(req, res) {
        const data = await this._service.uploadServiceImage(req.params.id, req.file);
        return apiResponse_1.ApiResponse.success(res, data, service_messages_1.MESSAGES.SERVICE.IMAGE_UPLOADED);
    }
    async deleteImage(req, res) {
        const data = await this._service.deleteServiceImage(req.params.id);
        return apiResponse_1.ApiResponse.success(res, data, service_messages_1.MESSAGES.SERVICE.IMAGE_DELETED);
    }
    async getPaginatedServices(req, res) {
        const query = {
            page: req.query.page ? Number(req.query.page) : 1,
            limit: req.query.limit ? Number(req.query.limit) : 10,
            search: typeof req.query.search === 'string' ? req.query.search : undefined,
            sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt',
            sortOrder: req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'
                ? req.query.sortOrder
                : 'desc',
            categoryId: typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined,
            status: req.query.status === 'ACTIVE' || req.query.status === 'INACTIVE'
                ? req.query.status
                : undefined,
            ...(typeof req.query.isDeleted === 'string' && {
                isDeleted: req.query.isDeleted === 'true',
            }),
        };
        const result = await this._service.getPaginatedServices(query);
        return apiResponse_1.ApiResponse.success(res, result, service_messages_1.MESSAGES.SERVICE.RETRIEVED_SUCCESSFULLY);
    }
    async getPublic(req, res) {
        const data = await this._service.list(false);
        const service = data.find((s) => s.id === req.params.id && !s.isDeleted && s.status === 'ACTIVE');
        if (!service) {
            throw new appError_1.AppError(service_messages_1.MESSAGES.SERVICE.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        return apiResponse_1.ApiResponse.success(res, service, service_messages_1.MESSAGES.SERVICE.RETRIEVED_SUCCESSFULLY);
    }
    async listPublicPaginated(req, res) {
        const query = {
            page: req.query.page ? Number(req.query.page) : 1,
            limit: req.query.limit ? Number(req.query.limit) : 10,
            search: typeof req.query.search === 'string' ? req.query.search : undefined,
            sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt',
            sortOrder: req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'
                ? req.query.sortOrder
                : 'desc',
            categoryId: typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined,
            status: 'ACTIVE',
            isDeleted: false,
        };
        const result = await this._service.getPaginatedServices(query);
        return apiResponse_1.ApiResponse.success(res, result, service_messages_1.MESSAGES.SERVICE.RETRIEVED_SUCCESSFULLY);
    }
};
exports.ServiceController = ServiceController;
exports.ServiceController = ServiceController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.ServiceService)),
    __metadata("design:paramtypes", [Object])
], ServiceController);
