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
exports.BranchService = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const branch_mapper_1 = require("../mapper/branch.mapper");
const branch_messages_1 = require("../constants/branch.messages");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
let BranchService = class BranchService {
    constructor(repo) {
        this.repo = repo;
    }
    async create(dto) {
        const branch = await this.repo.create(dto);
        return branch_mapper_1.BranchMapper.toResponse(branch);
    }
    async list(includeDeleted = false) {
        const branches = await this.repo.findAll(includeDeleted);
        return branches.map((b) => branch_mapper_1.BranchMapper.toResponse(b));
    }
    async update(id, dto) {
        const branch = await this.repo.update(id, dto);
        if (!branch)
            throw new appError_1.AppError(branch_messages_1.BRANCH_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        return branch_mapper_1.BranchMapper.toResponse(branch);
    }
    async disable(id) {
        const branch = await this.repo.disable(id);
        if (!branch)
            throw new appError_1.AppError(branch_messages_1.BRANCH_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        return branch_mapper_1.BranchMapper.toResponse(branch);
    }
    async restore(id) {
        const branch = await this.repo.restore(id);
        if (!branch)
            throw new appError_1.AppError(branch_messages_1.BRANCH_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        return branch_mapper_1.BranchMapper.toResponse(branch);
    }
    async getPaginatedBranches(query) {
        return this.repo.getPaginatedBranches(query);
    }
    async getNearestBranches(latitude, longitude, maxDistance = 5000000) {
        if (latitude === undefined || longitude === undefined) {
            throw new appError_1.AppError(branch_messages_1.BRANCH_MESSAGES.LATITUDE_LONGITUDE_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            throw new appError_1.AppError(branch_messages_1.BRANCH_MESSAGES.LATITUDE_LONGITUDE_MUST_BE_NUMBERS, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            throw new appError_1.AppError(branch_messages_1.BRANCH_MESSAGES.INVALID_COORDINATES, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        return this.repo.findNearestBranches(latitude, longitude, maxDistance);
    }
    async listPublic() {
        const branches = await this.repo.findAll(false);
        return branches.map((branch) => branch_mapper_1.BranchMapper.toResponse(branch));
    }
    async getPublic(id) {
        const branch = await this.repo.findById(id);
        if (!branch || branch.isDeleted) {
            throw new appError_1.AppError(branch_messages_1.BRANCH_MESSAGES.NOT_FOUND, httpStatus_enum_1.HttpStatus.NOT_FOUND);
        }
        return branch_mapper_1.BranchMapper.toResponse(branch);
    }
};
exports.BranchService = BranchService;
exports.BranchService = BranchService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.BranchRepository)),
    __metadata("design:paramtypes", [Object])
], BranchService);
