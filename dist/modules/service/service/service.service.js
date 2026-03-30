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
exports.ServiceService = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const service_messages_1 = require("../constants/service.messages");
const service_mapper_1 = require("../mapper/service.mapper");
const category_model_1 = require("../../../models/category.model");
let ServiceService = class ServiceService {
    constructor(_repo, _imageService) {
        this._repo = _repo;
        this._imageService = _imageService;
    }
    async create(dto) {
        if (!dto.name?.trim()) {
            throw new appError_1.AppError(service_messages_1.MESSAGES.SERVICE.NAME_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const category = await category_model_1.CategoryModel.findById(dto.categoryId);
        if (!category || category.isDeleted) {
            throw new appError_1.AppError(service_messages_1.MESSAGES.SERVICE.INVALID_CATEGORY, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const exists = await this._repo.findByNameAndCategory(dto.name.toLowerCase(), dto.categoryId);
        if (exists) {
            throw new appError_1.AppError(service_messages_1.MESSAGES.SERVICE.ALREADY_EXISTS, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const doc = await this._repo.create(dto);
        return service_mapper_1.ServiceMapper.toDto(doc);
    }
    async update(id, dto) {
        const update = {};
        if (dto.name?.trim())
            update.name = dto.name.trim().toLowerCase();
        if (dto.description !== undefined)
            update.description = dto.description?.trim();
        if (dto.status)
            update.status = dto.status;
        if (dto.imageUrl)
            update.imageUrl = dto.imageUrl;
        if (dto.categoryId)
            update.categoryId = dto.categoryId;
        if (dto.whatIncluded)
            update.whatIncluded = dto.whatIncluded;
        const doc = await this._repo.updateById(id, update);
        if (!doc)
            throw new appError_1.AppError(service_messages_1.MESSAGES.SERVICE.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        return service_mapper_1.ServiceMapper.toDto(doc);
    }
    async list(includeDeleted = false) {
        const docs = await this._repo.listAll(includeDeleted);
        const filtered = includeDeleted
            ? docs
            : docs.filter((d) => {
                const cat = d.categoryId;
                return cat && cat.status === 'ACTIVE' && !cat.isDeleted;
            });
        return filtered.map(service_mapper_1.ServiceMapper.toDto);
    }
    async softDelete(dto) {
        const doc = await this._repo.softDelete(dto.id);
        if (!doc)
            throw new appError_1.AppError(service_messages_1.MESSAGES.SERVICE.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        return service_mapper_1.ServiceMapper.toDto(doc);
    }
    async restore(dto) {
        const doc = await this._repo.restore(dto.id);
        if (!doc)
            throw new appError_1.AppError(service_messages_1.MESSAGES.SERVICE.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        return service_mapper_1.ServiceMapper.toDto(doc);
    }
    async getPaginatedServices(query) {
        return this._repo.getPaginatedServices(query);
    }
    async uploadServiceImage(serviceId, file) {
        const service = await this._repo.findById(serviceId);
        if (!service) {
            throw new appError_1.AppError(service_messages_1.MESSAGES.SERVICE.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        const imageUrl = await this._imageService.uploadServiceImage({
            file,
            userId: serviceId,
            role: 'service',
            serviceId,
        });
        if (service.imageUrl) {
            try {
                await this._imageService.deleteServiceImage(service.imageUrl);
            }
            catch (error) {
                console.error('Failed to delete old image:', error);
            }
        }
        const updatedService = await this._repo.updateImageUrl(serviceId, imageUrl);
        if (!updatedService) {
            throw new appError_1.AppError(service_messages_1.MESSAGES.SERVICE.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        return service_mapper_1.ServiceMapper.toDto(updatedService);
    }
    async deleteServiceImage(serviceId) {
        const service = await this._repo.findById(serviceId);
        if (!service) {
            throw new appError_1.AppError(service_messages_1.MESSAGES.SERVICE.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        if (!service.imageUrl) {
            throw new appError_1.AppError(service_messages_1.MESSAGES.SERVICE.NO_IMAGE_FOUND, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        await this._imageService.deleteServiceImage(service.imageUrl);
        const updatedService = await this._repo.updateImageUrl(serviceId, '');
        if (!updatedService) {
            throw new appError_1.AppError(service_messages_1.MESSAGES.SERVICE.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        return service_mapper_1.ServiceMapper.toDto(updatedService);
    }
};
exports.ServiceService = ServiceService;
exports.ServiceService = ServiceService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.ServiceRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.ImageService)),
    __metadata("design:paramtypes", [Object, Object])
], ServiceService);
