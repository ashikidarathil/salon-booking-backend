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
exports.CategoryService = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const category_messages_1 = require("../constants/category.messages");
const category_mapper_1 = require("../mapper/category.mapper");
let CategoryService = class CategoryService {
    constructor(_repo) {
        this._repo = _repo;
    }
    async create(dto) {
        const name = dto.name?.trim();
        if (!name)
            throw new appError_1.AppError(category_messages_1.MESSAGES.CATEGORY.NAME_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        const exists = await this._repo.findByName(name);
        if (exists)
            throw new appError_1.AppError(category_messages_1.MESSAGES.CATEGORY.ALREADY_EXISTS, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        const doc = await this._repo.create({ name, description: dto.description });
        return category_mapper_1.CategoryMapper.toDto(doc);
    }
    async update(id, dto) {
        const update = {};
        if (dto.name?.trim()) {
            update.name = dto.name.trim().toLowerCase();
        }
        if (dto.description !== undefined) {
            update.description = dto.description?.trim();
        }
        if (dto.status) {
            update.status = dto.status;
        }
        const doc = await this._repo.updateById(id, update);
        if (!doc) {
            throw new appError_1.AppError(category_messages_1.MESSAGES.CATEGORY.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        return category_mapper_1.CategoryMapper.toDto(doc);
    }
    async list(includeDeleted = false) {
        const docs = await this._repo.listAll(includeDeleted);
        return docs.map(category_mapper_1.CategoryMapper.toDto);
    }
    async softDelete(dto) {
        const doc = await this._repo.softDelete(dto.id);
        if (!doc)
            throw new appError_1.AppError(category_messages_1.MESSAGES.CATEGORY.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        return category_mapper_1.CategoryMapper.toDto(doc);
    }
    async restore(dto) {
        const doc = await this._repo.restore(dto.id);
        if (!doc)
            throw new appError_1.AppError(category_messages_1.MESSAGES.CATEGORY.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        return category_mapper_1.CategoryMapper.toDto(doc);
    }
    async getPaginatedCategories(query) {
        return this._repo.getPaginatedCategories(query);
    }
};
exports.CategoryService = CategoryService;
exports.CategoryService = CategoryService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.CategoryRepository)),
    __metadata("design:paramtypes", [Object])
], CategoryService);
