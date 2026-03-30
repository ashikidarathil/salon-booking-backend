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
exports.BranchServiceService = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const branchService_messages_1 = require("../constants/branchService.messages");
const branchService_mapper_1 = require("../mapper/branchService.mapper");
const service_model_1 = require("../../../models/service.model");
const pagination_query_dto_1 = require("../../../common/dto/pagination.query.dto");
const pagination_response_dto_1 = require("../../../common/dto/pagination.response.dto");
let BranchServiceService = class BranchServiceService {
    constructor(_repo, _branchCategoryRepo) {
        this._repo = _repo;
        this._branchCategoryRepo = _branchCategoryRepo;
    }
    async list(branchId) {
        if (!branchId) {
            throw new appError_1.AppError(branchService_messages_1.BRANCH_SERVICE_MESSAGES.BRANCH_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const services = await service_model_1.ServiceModel.find()
            .select('name categoryId isDeleted createdAt')
            .populate({
            path: 'categoryId',
            select: 'name',
        })
            .lean();
        const mappings = await this._repo.findByBranchId(branchId);
        const map = new Map();
        for (const m of mappings)
            map.set(m.serviceId.toString(), m);
        return services
            .filter((s) => !s.isDeleted)
            .map((s) => {
            const m = map.get(String(s._id));
            return branchService_mapper_1.BranchServiceMapper.toItem({
                branchId,
                serviceId: String(s._id),
                name: s.name,
                categoryId: s.categoryId ? String(s.categoryId) : undefined,
                categoryName: s.categoryId?.name,
                price: m ? m.price : null,
                duration: m ? m.duration : null,
                isActive: m ? m.isActive : false,
                configured: Boolean(m),
                createdAt: s.createdAt,
            });
        });
    }
    async upsert(branchId, serviceId, dto, adminId) {
        if (!branchId) {
            throw new appError_1.AppError(branchService_messages_1.BRANCH_SERVICE_MESSAGES.BRANCH_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (!serviceId) {
            throw new appError_1.AppError(branchService_messages_1.BRANCH_SERVICE_MESSAGES.SERVICE_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const svc = (await service_model_1.ServiceModel.findById(serviceId)
            .select('name categoryId')
            .populate({ path: 'categoryId', select: 'name' })
            .lean());
        const doc = await this._repo.upsert(branchId, serviceId, {
            price: Number(dto.price),
            duration: Number(dto.duration),
            isActive: dto.isActive ?? true,
        }, adminId);
        return branchService_mapper_1.BranchServiceMapper.toItem({
            branchId: doc.branchId.toString(),
            serviceId: doc.serviceId.toString(),
            name: svc?.name ?? 'Service',
            categoryId: svc?.categoryId ? String(svc.categoryId) : undefined,
            categoryName: svc?.categoryId?.name,
            price: doc.price,
            duration: doc.duration,
            isActive: doc.isActive,
            configured: true,
        });
    }
    async toggleStatus(branchId, serviceId, dto, adminId) {
        const doc = await this._repo.toggleStatus(branchId, serviceId, dto.isActive, adminId);
        return branchService_mapper_1.BranchServiceMapper.toStatus({
            branchId: doc.branchId.toString(),
            serviceId: doc.serviceId.toString(),
            isActive: doc.isActive,
        });
    }
    async listPaginated(branchId, query) {
        if (!branchId) {
            throw new appError_1.AppError(branchService_messages_1.BRANCH_SERVICE_MESSAGES.BRANCH_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const { params, search, sort } = pagination_query_dto_1.PaginationQueryParser.parse(query);
        const services = await service_model_1.ServiceModel.find()
            .select('name categoryId isDeleted createdAt')
            .populate({
            path: 'categoryId',
            select: 'name',
        })
            .lean();
        const mappings = await this._repo.findByBranchId(branchId);
        const map = new Map();
        for (const m of mappings)
            map.set(m.serviceId.toString(), m);
        let items = services
            .filter((s) => !s.isDeleted)
            .map((s) => {
            const m = map.get(String(s._id));
            return branchService_mapper_1.BranchServiceMapper.toItem({
                branchId,
                serviceId: String(s._id),
                name: s.name,
                categoryId: s.categoryId ? String(s.categoryId) : undefined,
                categoryName: s.categoryId?.name,
                price: m ? m.price : null,
                duration: m ? m.duration : null,
                isActive: m ? m.isActive : false,
                configured: Boolean(m),
                createdAt: s.createdAt,
            });
        });
        if (search) {
            const regex = new RegExp(search, 'i');
            items = items.filter((item) => regex.test(item.name) || (item.categoryName && regex.test(item.categoryName)));
        }
        const filterConfigured = query.configured;
        if (filterConfigured !== undefined) {
            items = items.filter((item) => item.configured === filterConfigured);
        }
        const filterActive = query.isActive;
        if (filterActive !== undefined) {
            items = items.filter((item) => item.isActive === filterActive);
        }
        const [sortByRaw, sortOrder] = Object.entries(sort)[0];
        const sortBy = sortByRaw;
        items.sort((a, b) => {
            const valA = a[sortBy];
            const valB = b[sortBy];
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
    async listPaginatedPublic(branchId, query) {
        if (!branchId) {
            throw new appError_1.AppError(branchService_messages_1.BRANCH_SERVICE_MESSAGES.BRANCH_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const { params, search, sort } = pagination_query_dto_1.PaginationQueryParser.parse(query);
        const services = await service_model_1.ServiceModel.find({ status: 'ACTIVE', isDeleted: false })
            .select('name categoryId description imageUrl whatIncluded status rating reviewCount createdAt')
            .populate({
            path: 'categoryId',
            select: 'name status isDeleted',
        })
            .lean();
        const branchCategories = await this._branchCategoryRepo.findByBranchId(branchId);
        const activeBranchCategoryIds = new Set(branchCategories.filter((bc) => bc.isActive).map((bc) => bc.categoryId.toString()));
        const mappings = await this._repo.findByBranchId(branchId);
        const map = new Map();
        for (const m of mappings) {
            if (m.isActive)
                map.set(m.serviceId.toString(), m);
        }
        let items = services.map((s) => {
            const m = map.get(String(s._id));
            return branchService_mapper_1.BranchServiceMapper.toItem({
                branchId,
                serviceId: String(s._id),
                name: s.name,
                categoryId: s.categoryId ? String(s.categoryId._id) : undefined,
                categoryName: s.categoryId?.name,
                imageUrl: s.imageUrl,
                description: s.description,
                whatIncluded: s.whatIncluded,
                price: m ? m.price : null,
                duration: m ? m.duration : null,
                isActive: m ? m.isActive : false,
                configured: Boolean(m),
                rating: s.rating,
                reviewCount: s.reviewCount,
                createdAt: s.createdAt,
            });
        });
        items = items.filter((item) => {
            const service = services.find((s) => String(s._id) === item.serviceId);
            const isGlobalCategoryActive = service?.categoryId?.status === 'ACTIVE' && !service?.categoryId?.isDeleted;
            const isBranchCategoryActive = item.categoryId
                ? activeBranchCategoryIds.has(item.categoryId)
                : true;
            return item.configured && isGlobalCategoryActive && isBranchCategoryActive;
        });
        if (search) {
            const regex = new RegExp(search, 'i');
            items = items.filter((item) => regex.test(item.name) || regex.test(item.categoryName || ''));
        }
        const categoryId = query.categoryId;
        if (categoryId) {
            items = items.filter((item) => item.categoryId === categoryId);
        }
        const [sortByRaw, sortOrder] = Object.entries(sort)[0];
        const sortBy = sortByRaw;
        items.sort((a, b) => {
            const valA = a[sortBy];
            const valB = b[sortBy];
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
    async getDetailsPublic(branchId, serviceId) {
        if (!branchId) {
            throw new appError_1.AppError(branchService_messages_1.BRANCH_SERVICE_MESSAGES.BRANCH_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (!serviceId) {
            throw new appError_1.AppError(branchService_messages_1.BRANCH_SERVICE_MESSAGES.SERVICE_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const service = (await service_model_1.ServiceModel.findById(serviceId)
            .select('name categoryId description imageUrl whatIncluded status isDeleted rating reviewCount')
            .populate({ path: 'categoryId', select: 'name status isDeleted' })
            .lean());
        if (!service ||
            service.isDeleted ||
            service.status !== 'ACTIVE' ||
            service.categoryId?.status !== 'ACTIVE' ||
            service.categoryId?.isDeleted) {
            throw new appError_1.AppError(branchService_messages_1.BRANCH_SERVICE_MESSAGES.SERVICE_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        if (service.categoryId) {
            const categoryIdStr = service.categoryId._id.toString();
            const branchCategories = await this._branchCategoryRepo.findByBranchId(branchId);
            const isBranchCategoryActive = branchCategories.some((bc) => bc.categoryId.toString() === categoryIdStr && bc.isActive);
            if (!isBranchCategoryActive) {
                throw new appError_1.AppError(branchService_messages_1.BRANCH_SERVICE_MESSAGES.SERVICE_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
            }
        }
        const mapping = await this._repo.findOne(branchId, serviceId);
        if (!mapping || !mapping.isActive) {
            throw new appError_1.AppError(branchService_messages_1.BRANCH_SERVICE_MESSAGES.SERVICE_NOT_AVAILABLE, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        return branchService_mapper_1.BranchServiceMapper.toItem({
            branchId,
            serviceId: String(service._id),
            name: service.name ?? 'Service',
            categoryId: service.categoryId ? String(service.categoryId._id) : undefined,
            categoryName: service.categoryId?.name,
            imageUrl: service.imageUrl,
            description: service.description,
            whatIncluded: service.whatIncluded,
            price: mapping.price,
            duration: mapping.duration,
            isActive: mapping.isActive,
            configured: true,
            rating: service.rating,
            reviewCount: service.reviewCount,
        });
    }
};
exports.BranchServiceService = BranchServiceService;
exports.BranchServiceService = BranchServiceService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.BranchServiceRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.BranchCategoryRepository)),
    __metadata("design:paramtypes", [Object, Object])
], BranchServiceService);
