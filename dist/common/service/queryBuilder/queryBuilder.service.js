"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilderService = void 0;
const tsyringe_1 = require("tsyringe");
const pagination_query_dto_1 = require("../../dto/pagination.query.dto");
const pagination_response_dto_1 = require("../../dto/pagination.response.dto");
let QueryBuilderService = class QueryBuilderService {
    async paginate(model, query, searchableFields, mapper, populate) {
        const { params, search, sort, filters } = pagination_query_dto_1.PaginationQueryParser.parse(query);
        const searchQuery = search
            ? pagination_query_dto_1.PaginationQueryParser.buildSearchQuery(search, searchableFields)
            : {};
        const finalQuery = {
            ...searchQuery,
            ...filters,
        };
        let mongoQuery = model.find(finalQuery).sort(sort).skip(params.skip).limit(params.limit);
        if (populate) {
            mongoQuery = mongoQuery.populate(populate);
        }
        const [data, totalItems] = await Promise.all([
            mongoQuery.lean().exec(),
            model.countDocuments(finalQuery),
        ]);
        return pagination_response_dto_1.PaginationResponseBuilder.build(data.map(mapper), totalItems, params.page, params.limit);
    }
    async paginateSimple(model, page = 1, limit = 10, mapper) {
        return this.paginate(model, { page, limit }, [], mapper);
    }
    async count(model, filters = {}) {
        return model.countDocuments(filters);
    }
    async exists(model, field, value, excludeId) {
        const query = { [field]: value };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }
        return (await model.countDocuments(query)) > 0;
    }
};
exports.QueryBuilderService = QueryBuilderService;
exports.QueryBuilderService = QueryBuilderService = __decorate([
    (0, tsyringe_1.injectable)()
], QueryBuilderService);
