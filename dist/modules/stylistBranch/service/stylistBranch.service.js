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
exports.StylistBranchService = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const stylistBranch_messages_1 = require("../constants/stylistBranch.messages");
const stylistBranch_mapper_1 = require("../mapper/stylistBranch.mapper");
const stylist_model_1 = require("../../../models/stylist.model");
const user_model_1 = require("../../../models/user.model");
const stylistBranch_model_1 = require("../../../models/stylistBranch.model");
const pagination_query_dto_1 = require("../../../common/dto/pagination.query.dto");
const pagination_response_dto_1 = require("../../../common/dto/pagination.response.dto");
let StylistBranchService = class StylistBranchService {
    constructor(repo) {
        this.repo = repo;
    }
    async listBranchStylists(branchId) {
        const mappings = await stylistBranch_model_1.StylistBranchModel.find({
            branchId,
            isActive: true,
        })
            .sort({ createdAt: -1 })
            .lean();
        if (mappings.length === 0)
            return [];
        const stylistIds = mappings.map((m) => m.stylistId);
        const stylists = await stylist_model_1.StylistModel.find({
            _id: { $in: stylistIds },
        })
            .select('userId specialization experience status')
            .lean();
        const stylistMap = new Map();
        stylists.forEach((s) => stylistMap.set(s._id.toString(), s));
        const userIds = stylists.map((s) => s.userId);
        const users = await user_model_1.UserModel.find({
            _id: { $in: userIds },
        })
            .select('name email phone')
            .lean();
        const userMap = new Map();
        users.forEach((u) => userMap.set(u._id.toString(), u));
        return mappings.map((m) => {
            const stylist = stylistMap.get(m.stylistId.toString());
            if (!stylist) {
                throw new appError_1.AppError(stylistBranch_messages_1.STYLIST_BRANCH_MESSAGES.STYLIST_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
            }
            const user = userMap.get(stylist.userId.toString());
            return stylistBranch_mapper_1.StylistBranchMapper.toBranchStylistItem({
                mappingId: m._id.toString(),
                branchId: m.branchId.toString(),
                stylistId: stylist._id.toString(),
                userId: stylist.userId.toString(),
                name: user?.name ?? 'Stylist',
                email: user?.email,
                phone: user?.phone,
                specialization: stylist.specialization,
                experience: stylist.experience,
                stylistStatus: stylist.status,
                assignedAt: m.assignedAt,
            });
        });
    }
    async listUnassignedOptionsPaginated(_branchId, query) {
        const { params, search } = pagination_query_dto_1.PaginationQueryParser.parse(query);
        const active = await stylistBranch_model_1.StylistBranchModel.find({ isActive: true }).select('stylistId').lean();
        const assignedStylistIds = active.map((x) => x.stylistId);
        const stylists = await stylist_model_1.StylistModel.find({
            _id: { $nin: assignedStylistIds },
        })
            .select('userId specialization experience status')
            .sort({ createdAt: -1 })
            .lean();
        if (stylists.length === 0) {
            return pagination_response_dto_1.PaginationResponseBuilder.build([], 0, params.page, params.limit);
        }
        const userIds = stylists.map((s) => s.userId);
        const users = await user_model_1.UserModel.find({ _id: { $in: userIds } })
            .select('name email phone')
            .lean();
        const userMap = new Map();
        users.forEach((u) => userMap.set(u._id.toString(), u));
        let items = stylists.map((s) => {
            const user = userMap.get(s.userId.toString());
            return stylistBranch_mapper_1.StylistBranchMapper.toUnassignedOption({
                stylistId: s._id.toString(),
                userId: s.userId.toString(),
                name: user?.name || 'Stylist',
                email: user?.email,
                phone: user?.phone,
                specialization: s.specialization,
                experience: s.experience,
                stylistStatus: s.status,
            });
        });
        if (search) {
            const regex = new RegExp(search, 'i');
            items = items.filter((item) => regex.test(item.name) || regex.test(item.email || '') || regex.test(item.specialization));
        }
        const totalItems = items.length;
        const paginatedItems = items.slice(params.skip, params.skip + params.limit);
        return pagination_response_dto_1.PaginationResponseBuilder.build(paginatedItems, totalItems, params.page, params.limit);
    }
    async listUnassignedOptions(_branchId) {
        const active = await stylistBranch_model_1.StylistBranchModel.find({ isActive: true }).select('stylistId').lean();
        const assignedStylistIds = active.map((x) => x.stylistId);
        const stylists = await stylist_model_1.StylistModel.find({
            _id: { $nin: assignedStylistIds },
        })
            .select('userId specialization experience status')
            .sort({ createdAt: -1 })
            .lean();
        if (stylists.length === 0)
            return [];
        const userIds = stylists.map((s) => s.userId);
        const users = await user_model_1.UserModel.find({ _id: { $in: userIds } })
            .select('name email phone')
            .lean();
        const userMap = new Map();
        users.forEach((u) => userMap.set(u._id.toString(), u));
        return stylists.map((s) => {
            const user = userMap.get(s.userId.toString());
            return stylistBranch_mapper_1.StylistBranchMapper.toUnassignedOption({
                stylistId: s._id.toString(),
                userId: s.userId.toString(),
                name: user?.name || 'Stylist',
                email: user?.email,
                phone: user?.phone,
                specialization: s.specialization,
                experience: s.experience,
                stylistStatus: s.status,
            });
        });
    }
    async assign(branchId, dto, adminId) {
        const stylist = await stylist_model_1.StylistModel.findById(dto.stylistId)
            .select('_id userId specialization experience status')
            .lean();
        if (!stylist)
            throw new appError_1.AppError(stylistBranch_messages_1.STYLIST_BRANCH_MESSAGES.STYLIST_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        const existing = await this.repo.findActiveByStylistId(dto.stylistId);
        if (existing) {
            throw new appError_1.AppError(stylistBranch_messages_1.STYLIST_BRANCH_MESSAGES.STYLIST_ALREADY_ASSIGNED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const mapping = await this.repo.createAssignment(dto.stylistId, branchId, adminId);
        const user = await user_model_1.UserModel.findById(stylist.userId).select('name email phone').lean();
        return stylistBranch_mapper_1.StylistBranchMapper.toBranchStylistItem({
            mappingId: mapping._id.toString(),
            branchId: mapping.branchId.toString(),
            stylistId: stylist._id.toString(),
            userId: stylist.userId.toString(),
            name: user?.name || 'Stylist',
            email: user?.email,
            phone: user?.phone,
            specialization: stylist.specialization,
            experience: stylist.experience,
            stylistStatus: stylist.status,
            assignedAt: mapping.assignedAt,
        });
    }
    async unassign(branchId, dto) {
        const updated = await this.repo.deactivateAssignment(dto.stylistId, branchId);
        if (!updated)
            throw new appError_1.AppError(stylistBranch_messages_1.STYLIST_BRANCH_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        return { success: true };
    }
    async changeBranch(branchId, dto, adminId) {
        const stylist = await stylist_model_1.StylistModel.findById(dto.stylistId)
            .select('_id userId specialization experience status')
            .lean();
        if (!stylist)
            throw new appError_1.AppError(stylistBranch_messages_1.STYLIST_BRANCH_MESSAGES.STYLIST_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        await this.repo.deactivateAnyActiveAssignment(dto.stylistId);
        const mapping = await this.repo.createAssignment(dto.stylistId, branchId, adminId);
        const user = await user_model_1.UserModel.findById(stylist.userId).select('name email phone').lean();
        return stylistBranch_mapper_1.StylistBranchMapper.toBranchStylistItem({
            mappingId: mapping._id.toString(),
            branchId: mapping.branchId.toString(),
            stylistId: stylist._id.toString(),
            userId: stylist.userId.toString(),
            name: user?.name || 'Stylist',
            email: user?.email,
            phone: user?.phone,
            specialization: stylist.specialization,
            experience: stylist.experience,
            stylistStatus: stylist.status,
            assignedAt: mapping.assignedAt,
        });
    }
    async listBranchStylistsPaginated(branchId, query) {
        const { params, search } = pagination_query_dto_1.PaginationQueryParser.parse(query);
        const mappings = await stylistBranch_model_1.StylistBranchModel.find({
            branchId,
            isActive: true,
        })
            .sort({ createdAt: -1 })
            .lean();
        if (mappings.length === 0) {
            return pagination_response_dto_1.PaginationResponseBuilder.build([], 0, params.page, params.limit);
        }
        const stylistIds = mappings.map((m) => m.stylistId);
        const stylists = await stylist_model_1.StylistModel.find({
            _id: { $in: stylistIds },
        })
            .select('userId specialization experience status')
            .lean();
        const stylistMap = new Map();
        stylists.forEach((s) => stylistMap.set(s._id.toString(), s));
        const userIds = stylists.map((s) => s.userId);
        const users = await user_model_1.UserModel.find({
            _id: { $in: userIds },
        })
            .select('name email phone')
            .lean();
        const userMap = new Map();
        users.forEach((u) => userMap.set(u._id.toString(), u));
        let items = mappings.map((m) => {
            const stylist = stylistMap.get(m.stylistId.toString());
            if (!stylist) {
                throw new appError_1.AppError(stylistBranch_messages_1.STYLIST_BRANCH_MESSAGES.STYLIST_NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
            }
            const user = userMap.get(stylist.userId.toString());
            return stylistBranch_mapper_1.StylistBranchMapper.toBranchStylistItem({
                mappingId: m._id.toString(),
                branchId: m.branchId.toString(),
                stylistId: stylist._id.toString(),
                userId: stylist.userId.toString(),
                name: user?.name ?? 'Stylist',
                email: user?.email,
                phone: user?.phone,
                specialization: stylist.specialization,
                experience: stylist.experience,
                stylistStatus: stylist.status,
                assignedAt: m.assignedAt,
            });
        });
        if (search) {
            const regex = new RegExp(search, 'i');
            items = items.filter((item) => regex.test(item.name) || regex.test(item.email || '') || regex.test(item.specialization));
        }
        const totalItems = items.length;
        const paginatedItems = items.slice(params.skip, params.skip + params.limit);
        return pagination_response_dto_1.PaginationResponseBuilder.build(paginatedItems, totalItems, params.page, params.limit);
    }
    async getStylistBranches(userIdOrStylistId) {
        // First, try to find stylist by userId (in case they pass user ID)
        let stylistId = userIdOrStylistId;
        const stylistByUserId = await stylist_model_1.StylistModel.findOne({ userId: userIdOrStylistId })
            .select('_id')
            .lean();
        if (stylistByUserId) {
            stylistId = stylistByUserId._id.toString();
        }
        const mappings = await stylistBranch_model_1.StylistBranchModel.find({
            stylistId,
            isActive: true,
        })
            .sort({ createdAt: -1 })
            .lean();
        return mappings.map((m) => ({
            branchId: m.branchId.toString(),
            stylistId: m.stylistId.toString(),
            isActive: m.isActive,
            assignedAt: m.assignedAt,
        }));
    }
};
exports.StylistBranchService = StylistBranchService;
exports.StylistBranchService = StylistBranchService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.StylistBranchRepository)),
    __metadata("design:paramtypes", [Object])
], StylistBranchService);
