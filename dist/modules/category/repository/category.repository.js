"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const tsyringe_1 = require("tsyringe");
const category_model_1 = require("../../../models/category.model");
const pagination_query_dto_1 = require("../../../common/dto/pagination.query.dto");
const category_mapper_1 = require("../mapper/category.mapper");
let CategoryRepository = class CategoryRepository {
    async create(data) {
        const doc = new category_model_1.CategoryModel({
            name: data.name.trim().toLowerCase(),
            description: data.description?.trim(),
        });
        await doc.save();
        return doc;
    }
    async findByName(name) {
        return category_model_1.CategoryModel.findOne({ name: name.trim().toLowerCase() });
    }
    async findById(id) {
        return category_model_1.CategoryModel.findById(id);
    }
    async listAll(includeDeleted = false) {
        const filter = includeDeleted ? {} : { isDeleted: false };
        return category_model_1.CategoryModel.find(filter).sort({ createdAt: -1 });
    }
    async getPaginatedCategories(query) {
        const { params, search, sort, filters } = pagination_query_dto_1.PaginationQueryParser.parse(query);
        const finalQuery = {};
        if (typeof filters.isDeleted === 'boolean') {
            finalQuery.isDeleted = filters.isDeleted;
        }
        if (filters.status) {
            finalQuery.status = filters.status;
        }
        if (search) {
            const regex = new RegExp(search, 'i');
            finalQuery.$or = [{ name: regex }, { description: regex }];
        }
        const [categories, totalItems] = await Promise.all([
            category_model_1.CategoryModel.find(finalQuery).sort(sort).skip(params.skip).limit(params.limit).lean(),
            category_model_1.CategoryModel.countDocuments(finalQuery),
        ]);
        if (categories.length === 0) {
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
        const result = categories.map((cat) => category_mapper_1.CategoryMapper.toDto(cat));
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
    async updateById(id, data) {
        return category_model_1.CategoryModel.findByIdAndUpdate(id, data, { new: true });
    }
    async softDelete(id) {
        return category_model_1.CategoryModel.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date(), status: 'INACTIVE' }, { new: true });
    }
    async restore(id) {
        return category_model_1.CategoryModel.findByIdAndUpdate(id, { isDeleted: false, deletedAt: null }, { new: true });
    }
};
exports.CategoryRepository = CategoryRepository;
exports.CategoryRepository = CategoryRepository = __decorate([
    (0, tsyringe_1.injectable)()
], CategoryRepository);
