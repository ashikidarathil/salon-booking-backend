"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRepository = void 0;
const tsyringe_1 = require("tsyringe");
const service_model_1 = require("../../../models/service.model");
const pagination_query_dto_1 = require("../../../common/dto/pagination.query.dto");
const service_mapper_1 = require("../mapper/service.mapper");
let ServiceRepository = class ServiceRepository {
    async create(data) {
        const doc = new service_model_1.ServiceModel({
            name: data.name.trim().toLowerCase(),
            description: data.description?.trim(),
            categoryId: data.categoryId,
            imageUrl: data.imageUrl,
            whatIncluded: data.whatIncluded || [],
        });
        await doc.save();
        return doc;
    }
    async findById(id) {
        return service_model_1.ServiceModel.findById(id);
    }
    async findByNameAndCategory(name, categoryId) {
        return service_model_1.ServiceModel.findOne({
            name: name.trim(),
            categoryId,
        });
    }
    async listAll(includeDeleted = false) {
        const filter = includeDeleted ? {} : { isDeleted: false };
        return service_model_1.ServiceModel.find(filter)
            .populate('categoryId', 'name status isDeleted')
            .sort({ createdAt: -1 });
    }
    async updateById(id, data) {
        return service_model_1.ServiceModel.findByIdAndUpdate(id, data, { new: true });
    }
    async updateImageUrl(id, imageUrl) {
        return service_model_1.ServiceModel.findByIdAndUpdate(id, { imageUrl }, { new: true });
    }
    async softDelete(id) {
        return service_model_1.ServiceModel.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date(), status: 'INACTIVE' }, { new: true });
    }
    async restore(id) {
        return service_model_1.ServiceModel.findByIdAndUpdate(id, { isDeleted: false, deletedAt: null }, { new: true });
    }
    async getPaginatedServices(query) {
        const { params, search, sort, filters } = pagination_query_dto_1.PaginationQueryParser.parse(query);
        const finalQuery = {};
        if (typeof filters.isDeleted === 'boolean') {
            finalQuery.isDeleted = filters.isDeleted;
        }
        if (filters.status) {
            finalQuery.status = filters.status;
        }
        if (filters.categoryId) {
            finalQuery.categoryId = filters.categoryId;
        }
        if (search) {
            const regex = new RegExp(search, 'i');
            finalQuery.$or = [{ name: regex }, { description: regex }];
        }
        const [services, totalItems] = await Promise.all([
            service_model_1.ServiceModel.find(finalQuery)
                .populate('categoryId', 'name status isDeleted')
                .sort(sort)
                .skip(params.skip)
                .limit(params.limit)
                .lean(),
            service_model_1.ServiceModel.countDocuments(finalQuery),
        ]);
        if (services.length === 0) {
            return {
                data: [],
                pagination: {
                    currentPage: params.page,
                    totalPages: 0,
                    totalItems: 0,
                    itemsPerPage: params.limit,
                    hasNextPage: false,
                    hasPreviousPage: false,
                },
            };
        }
        const result = services.map((svc) => service_mapper_1.ServiceMapper.toDto(svc));
        const totalPages = Math.ceil(totalItems / params.limit);
        const hasNextPage = params.page < totalPages;
        const hasPreviousPage = params.page > 1;
        return {
            data: result,
            pagination: {
                currentPage: params.page,
                totalPages,
                totalItems,
                itemsPerPage: params.limit,
                hasNextPage,
                hasPreviousPage,
            },
        };
    }
    async update(id, data) {
        await service_model_1.ServiceModel.findByIdAndUpdate(id, data);
    }
};
exports.ServiceRepository = ServiceRepository;
exports.ServiceRepository = ServiceRepository = __decorate([
    (0, tsyringe_1.injectable)()
], ServiceRepository);
