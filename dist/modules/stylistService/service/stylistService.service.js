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
exports.StylistServiceService = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const stylistService_messages_1 = require("../constants/stylistService.messages");
const stylistService_mapper_1 = require("../mapper/stylistService.mapper");
const pagination_query_dto_1 = require("../../../common/dto/pagination.query.dto");
const pagination_response_dto_1 = require("../../../common/dto/pagination.response.dto");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
const branchService_model_1 = require("../../../models/branchService.model");
const stylist_model_1 = require("../../../models/stylist.model");
let StylistServiceService = class StylistServiceService {
    constructor(_repo, _serviceRepo) {
        this._repo = _repo;
        this._serviceRepo = _serviceRepo;
    }
    async getMappedServices(rawStylistId, branchId) {
        let stylistId = rawStylistId;
        if ((0, mongoose_util_1.isValidObjectId)(rawStylistId)) {
            const byUserId = await stylist_model_1.StylistModel.findOne({ userId: (0, mongoose_util_1.toObjectId)(rawStylistId) })
                .select('_id')
                .lean();
            if (byUserId) {
                stylistId = byUserId._id.toString();
            }
        }
        const services = await this._serviceRepo.listAll();
        const mappings = await this._repo.findByStylistId(stylistId);
        const map = new Map();
        for (const m of mappings)
            map.set(m.serviceId.toString(), m);
        // Load branch pricing if branchId is provided
        const branchPriceMap = new Map();
        if (branchId) {
            const branchServices = await branchService_model_1.BranchServiceModel.find({
                branchId: (0, mongoose_util_1.toObjectId)(branchId),
                isActive: true,
            }).lean();
            for (const bs of branchServices) {
                branchPriceMap.set(bs.serviceId.toString(), { price: bs.price, duration: bs.duration });
            }
        }
        return services.map((s) => {
            const category = s.categoryId;
            const m = map.get(String(s._id));
            const pricing = branchPriceMap.get(String(s._id));
            return stylistService_mapper_1.StylistServiceMapper.toItem({
                stylistId,
                serviceId: String(s._id),
                name: s.name,
                categoryId: category ? String(category._id) : undefined,
                categoryName: category?.name,
                isActive: m ? m.isActive : false,
                configured: Boolean(m),
                price: pricing?.price,
                duration: pricing?.duration,
                createdAt: s.createdAt,
            });
        });
    }
    async list(stylistId, branchId) {
        if (!stylistId) {
            throw new appError_1.AppError(stylistService_messages_1.STYLIST_SERVICE_MESSAGES.STYLIST_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        return this.getMappedServices(stylistId, branchId);
    }
    async toggleStatus(stylistId, serviceId, dto, adminId) {
        if (!stylistId)
            throw new appError_1.AppError(stylistService_messages_1.STYLIST_SERVICE_MESSAGES.STYLIST_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        if (!serviceId)
            throw new appError_1.AppError(stylistService_messages_1.STYLIST_SERVICE_MESSAGES.SERVICE_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        const doc = await this._repo.toggleStatus(stylistId, serviceId, dto.isActive, adminId);
        if (!doc)
            throw new appError_1.AppError(stylistService_messages_1.STYLIST_SERVICE_MESSAGES.SERVICE_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        return stylistService_mapper_1.StylistServiceMapper.toStatus(doc);
    }
    async listPaginated(stylistId, query) {
        if (!stylistId) {
            throw new appError_1.AppError(stylistService_messages_1.STYLIST_SERVICE_MESSAGES.STYLIST_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const { params, search, sort } = pagination_query_dto_1.PaginationQueryParser.parse(query);
        let items = await this.getMappedServices(stylistId);
        if (search) {
            const regex = new RegExp(search, 'i');
            items = items.filter((item) => regex.test(item.name) || (item.categoryName && regex.test(item.categoryName)));
        }
        if (query.configured !== undefined) {
            const isConfigured = String(query.configured) === 'true';
            items = items.filter((item) => item.configured === isConfigured);
        }
        if (query.isActive !== undefined) {
            const isActive = String(query.isActive) === 'true';
            items = items.filter((item) => item.isActive === isActive);
        }
        // Default sort by createdAt desc if not provided
        const sortField = (sort && Object.keys(sort).length > 0 ? Object.keys(sort)[0] : 'createdAt');
        const sortOrder = sort && Object.keys(sort).length > 0 ? sort[sortField] : -1;
        items.sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];
            if (typeof valA === 'string' && typeof valB === 'string') {
                return sortOrder === 1 ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            if (valA === undefined || valA === null)
                return sortOrder === 1 ? 1 : -1;
            if (valB === undefined || valB === null)
                return sortOrder === 1 ? -1 : 1;
            if (valA < valB)
                return sortOrder === 1 ? -1 : 1;
            if (valA > valB)
                return sortOrder === 1 ? 1 : -1;
            return 0;
        });
        const totalItems = items.length;
        const paginatedItems = items.slice(params.skip, params.skip + params.limit);
        return pagination_response_dto_1.PaginationResponseBuilder.build(paginatedItems, totalItems, params.page, params.limit);
    }
    async getStylistsByService(serviceId) {
        if (!serviceId) {
            throw new appError_1.AppError(stylistService_messages_1.STYLIST_SERVICE_MESSAGES.SERVICE_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const mappings = await this._repo.findByServiceId(serviceId);
        return mappings.map(stylistService_mapper_1.StylistServiceMapper.toStylist);
    }
};
exports.StylistServiceService = StylistServiceService;
exports.StylistServiceService = StylistServiceService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.StylistServiceRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.ServiceRepository)),
    __metadata("design:paramtypes", [Object, Object])
], StylistServiceService);
