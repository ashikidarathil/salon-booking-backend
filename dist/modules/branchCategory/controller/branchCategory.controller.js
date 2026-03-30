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
exports.BranchCategoryController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const apiResponse_1 = require("../../../common/response/apiResponse");
const branchCategory_messages_1 = require("../constants/branchCategory.messages");
let BranchCategoryController = class BranchCategoryController {
    constructor(service) {
        this.service = service;
        this.list = async (req, res) => {
            const data = await this.service.list(req.params.branchId);
            return apiResponse_1.ApiResponse.success(res, data, branchCategory_messages_1.BRANCH_CATEGORY_MESSAGES.LISTED);
        };
        this.toggle = async (req, res) => {
            const data = await this.service.toggle(req.params.branchId, req.params.categoryId, { isActive: Boolean(req.body.isActive) }, req.auth.userId);
            return apiResponse_1.ApiResponse.success(res, data, branchCategory_messages_1.BRANCH_CATEGORY_MESSAGES.UPDATED);
        };
        this.listPaginated = async (req, res) => {
            const query = {
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 10,
                search: typeof req.query.search === 'string' ? req.query.search : undefined,
                sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : 'name',
                sortOrder: req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'
                    ? req.query.sortOrder
                    : 'asc',
                ...(typeof req.query.isActive === 'string' && {
                    isActive: req.query.isActive === 'true',
                }),
            };
            const data = await this.service.listPaginated(req.params.branchId, query);
            return apiResponse_1.ApiResponse.success(res, data, branchCategory_messages_1.BRANCH_CATEGORY_MESSAGES.LISTED);
        };
    }
};
exports.BranchCategoryController = BranchCategoryController;
exports.BranchCategoryController = BranchCategoryController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.BranchCategoryService)),
    __metadata("design:paramtypes", [Object])
], BranchCategoryController);
