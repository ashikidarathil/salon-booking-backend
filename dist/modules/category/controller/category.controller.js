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
exports.CategoryController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const apiResponse_1 = require("../../../common/response/apiResponse");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const category_messages_1 = require("../constants/category.messages");
const category_constants_1 = require("../constants/category.constants");
let CategoryController = class CategoryController {
    constructor(_service) {
        this._service = _service;
    }
    async create(req, res) {
        const dto = {
            name: req.body.name,
            description: req.body.description,
        };
        const data = await this._service.create(dto);
        return apiResponse_1.ApiResponse.success(res, data, category_messages_1.MESSAGES.CATEGORY.CREATED, httpStatus_enum_1.HttpStatus.CREATED);
    }
    async update(req, res) {
        const dto = {
            name: req.body.name,
            description: req.body.description,
            status: req.body.status,
        };
        const data = await this._service.update(req.params.id, dto);
        return apiResponse_1.ApiResponse.success(res, data, category_messages_1.MESSAGES.CATEGORY.UPDATED);
    }
    async listAdmin(req, res) {
        const includeDeleted = req.query.includeDeleted === 'true';
        const data = await this._service.list(includeDeleted);
        return apiResponse_1.ApiResponse.success(res, data, category_messages_1.MESSAGES.CATEGORY.LISTED);
    }
    async listPublic(_req, res) {
        const data = await this._service.list(false);
        const activeOnly = data.filter((c) => !c.isDeleted && c.status === category_constants_1.CategoryStatus.ACTIVE);
        return apiResponse_1.ApiResponse.success(res, activeOnly, category_messages_1.MESSAGES.CATEGORY.LISTED);
    }
    async softDelete(req, res) {
        const dto = {
            id: req.params.id,
        };
        const data = await this._service.softDelete(dto);
        return apiResponse_1.ApiResponse.success(res, data, category_messages_1.MESSAGES.CATEGORY.DELETED);
    }
    async restore(req, res) {
        const dto = {
            id: req.params.id,
        };
        const data = await this._service.restore(dto);
        return apiResponse_1.ApiResponse.success(res, data, category_messages_1.MESSAGES.CATEGORY.RESTORED);
    }
    async getPaginatedCategories(req, res) {
        const query = {
            page: req.query.page ? Number(req.query.page) : 1,
            limit: req.query.limit ? Number(req.query.limit) : 10,
            search: typeof req.query.search === 'string' ? req.query.search : undefined,
            sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt',
            sortOrder: req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'
                ? req.query.sortOrder
                : 'desc',
            status: Object.values(category_constants_1.CategoryStatus).includes(req.query.status)
                ? req.query.status
                : undefined,
            ...(typeof req.query.isDeleted === 'string' && {
                isDeleted: req.query.isDeleted === 'true',
            }),
        };
        const result = await this._service.getPaginatedCategories(query);
        return apiResponse_1.ApiResponse.success(res, result, category_messages_1.MESSAGES.CATEGORY.RETRIEVED_SUCCESSFULLY);
    }
};
exports.CategoryController = CategoryController;
exports.CategoryController = CategoryController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.CategoryService)),
    __metadata("design:paramtypes", [Object])
], CategoryController);
