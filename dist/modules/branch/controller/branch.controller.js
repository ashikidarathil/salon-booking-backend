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
exports.BranchController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const apiResponse_1 = require("../../../common/response/apiResponse");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const branch_messages_1 = require("../constants/branch.messages");
let BranchController = class BranchController {
    constructor(service) {
        this.service = service;
        this.create = async (req, res) => {
            const dto = {
                name: req.body.name,
                address: req.body.address,
                phone: req.body.phone,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                defaultBreaks: req.body.globalBreaks || req.body.defaultBreaks,
            };
            const data = await this.service.create(dto);
            return apiResponse_1.ApiResponse.success(res, data, branch_messages_1.BRANCH_MESSAGES.CREATED, httpStatus_enum_1.HttpStatus.CREATED);
        };
        this.list = async (req, res) => {
            const includeDeleted = req.query.includeDeleted === 'true';
            const data = await this.service.list(includeDeleted);
            return apiResponse_1.ApiResponse.success(res, data, branch_messages_1.BRANCH_MESSAGES.LISTED);
        };
        this.update = async (req, res) => {
            const dto = {
                name: req.body.name,
                address: req.body.address,
                phone: req.body.phone,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                defaultBreaks: req.body.globalBreaks || req.body.defaultBreaks,
            };
            const data = await this.service.update(req.params.id, dto);
            return apiResponse_1.ApiResponse.success(res, data, branch_messages_1.BRANCH_MESSAGES.UPDATED);
        };
        this.disable = async (req, res) => {
            const data = await this.service.disable(req.params.id);
            return apiResponse_1.ApiResponse.success(res, data, branch_messages_1.BRANCH_MESSAGES.DISABLED);
        };
        this.restore = async (req, res) => {
            const data = await this.service.restore(req.params.id);
            return apiResponse_1.ApiResponse.success(res, data, branch_messages_1.BRANCH_MESSAGES.RESTORED);
        };
        this.getPaginatedBranches = async (req, res) => {
            const query = {
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 10,
                search: typeof req.query.search === 'string' ? req.query.search : undefined,
                sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt',
                sortOrder: req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'
                    ? req.query.sortOrder
                    : 'desc',
                ...(typeof req.query.isDeleted === 'string' && {
                    isDeleted: req.query.isDeleted === 'true',
                }),
            };
            const result = await this.service.getPaginatedBranches(query);
            return apiResponse_1.ApiResponse.success(res, result, branch_messages_1.BRANCH_MESSAGES.RETRIEVED_SUCCESSFULLY);
        };
        this.getNearestBranches = async (req, res) => {
            const dto = {
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                maxDistance: req.body.maxDistance,
            };
            const data = await this.service.getNearestBranches(dto.latitude, dto.longitude, dto.maxDistance);
            return apiResponse_1.ApiResponse.success(res, data, branch_messages_1.BRANCH_MESSAGES.NEAREST_FOUND);
        };
        this.listPublic = async (req, res) => {
            const branches = await this.service.listPublic();
            return apiResponse_1.ApiResponse.success(res, branches, branch_messages_1.BRANCH_MESSAGES.FETCHED_SUCCESSFULLY);
        };
        this.getPublic = async (req, res) => {
            const { id } = req.params;
            const branch = await this.service.getPublic(id);
            return apiResponse_1.ApiResponse.success(res, branch, branch_messages_1.BRANCH_MESSAGES.FETCHED_SUCCESSFULLY);
        };
        this.listPublicPaginated = async (req, res) => {
            const query = {
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 10,
                search: typeof req.query.search === 'string' ? req.query.search : undefined,
                sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt',
                sortOrder: req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'
                    ? req.query.sortOrder
                    : 'desc',
                isDeleted: false,
            };
            const result = await this.service.getPaginatedBranches(query);
            return apiResponse_1.ApiResponse.success(res, result, branch_messages_1.BRANCH_MESSAGES.RETRIEVED_SUCCESSFULLY);
        };
    }
};
exports.BranchController = BranchController;
exports.BranchController = BranchController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.BranchService)),
    __metadata("design:paramtypes", [Object])
], BranchController);
