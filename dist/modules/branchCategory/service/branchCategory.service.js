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
exports.BranchCategoryService = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const appError_1 = require("../../../common/errors/appError");
const httpStatus_enum_1 = require("../../../common/enums/httpStatus.enum");
const branchCategory_messages_1 = require("../constants/branchCategory.messages");
const branchCategory_mapper_1 = require("../mapper/branchCategory.mapper");
const category_model_1 = require("../../../models/category.model");
const pagination_query_dto_1 = require("../../../common/dto/pagination.query.dto");
const pagination_response_dto_1 = require("../../../common/dto/pagination.response.dto");
let BranchCategoryService = class BranchCategoryService {
    constructor(_repo) {
        this._repo = _repo;
    }
    async list(branchId) {
        if (!branchId) {
            throw new appError_1.AppError(branchCategory_messages_1.BRANCH_CATEGORY_MESSAGES.BRANCH_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const categories = (await category_model_1.CategoryModel.find()
            .select('name isDeleted')
            .lean());
        const mappings = await this._repo.findByBranchId(branchId);
        const activeMap = new Map();
        for (const m of mappings)
            activeMap.set(m.categoryId.toString(), m.isActive);
        return categories
            .filter((c) => !c.isDeleted)
            .map((c) => branchCategory_mapper_1.BranchCategoryMapper.toItem({
            branchId,
            categoryId: String(c._id),
            name: c.name,
            isActive: activeMap.get(String(c._id)) ?? false,
        }));
    }
    async toggle(branchId, categoryId, dto, adminId) {
        if (!branchId) {
            throw new appError_1.AppError(branchCategory_messages_1.BRANCH_CATEGORY_MESSAGES.BRANCH_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (!categoryId) {
            throw new appError_1.AppError(branchCategory_messages_1.BRANCH_CATEGORY_MESSAGES.CATEGORY_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const doc = await this._repo.upsert(branchId, categoryId, dto.isActive, adminId);
        const category = (await category_model_1.CategoryModel.findById(categoryId).select('name').lean());
        return branchCategory_mapper_1.BranchCategoryMapper.toItem({
            branchId: doc.branchId.toString(),
            categoryId: doc.categoryId.toString(),
            name: category?.name ?? 'Category',
            isActive: doc.isActive,
        });
    }
    /*
    async listPaginated(
      branchId: string,
      query: PaginationQueryDto,
    ): Promise<PaginatedResponse<BranchCategoryItemResponse>> {
      if (!branchId) {
        throw new AppError(BRANCH_CATEGORY_MESSAGES.BRANCH_REQUIRED, HttpStatus.BAD_REQUEST);
      }
  
      const { params, search } = PaginationQueryParser.parse(query);
  
      const categories = (await CategoryModel.find()
        .select('name isDeleted')
        .lean()) as CategoryLean[];
  
      const mappings = await this._repo.findByBranchId(branchId);
      const activeMap = new Map<string, boolean>();
      for (const m of mappings) activeMap.set(m.categoryId.toString(), m.isActive);
  
      let items = categories
        .filter((c) => !c.isDeleted)
        .map((c) =>
          BranchCategoryMapper.toItem({
            branchId,
            categoryId: String(c._id),
            name: c.name,
            isActive: activeMap.get(String(c._id)) ?? false,
          }),
        );
  
      if (search) {
        const regex = new RegExp(search, 'i');
        items = items.filter((item) => regex.test(item.name));
      }
  
      const filterActive = query.isActive;
      if (filterActive !== undefined) {
        items = items.filter((item) => item.isActive === filterActive);
      }
  
      const totalItems = items.length;
  
      const paginatedItems = items.slice(params.skip, params.skip + params.limit);
  
      return PaginationResponseBuilder.build(paginatedItems, totalItems, params.page, params.limit);
    }
  */
    async listPaginated(branchId, query) {
        if (!branchId) {
            throw new appError_1.AppError(branchCategory_messages_1.BRANCH_CATEGORY_MESSAGES.BRANCH_REQUIRED, httpStatus_enum_1.HttpStatus.BAD_REQUEST);
        }
        const { params, search } = pagination_query_dto_1.PaginationQueryParser.parse(query);
        const categories = await this._repo.findAllCategories();
        const mappings = await this._repo.findByBranchId(branchId);
        const activeMap = new Map();
        for (const m of mappings) {
            activeMap.set(m.categoryId.toString(), m.isActive);
        }
        let items = categories
            .filter((c) => !c.isDeleted)
            .map((c) => branchCategory_mapper_1.BranchCategoryMapper.toItem({
            branchId,
            categoryId: String(c._id),
            name: c.name,
            isActive: activeMap.get(String(c._id)) ?? false,
        }));
        if (search) {
            const regex = new RegExp(search, 'i');
            items = items.filter((item) => regex.test(item.name));
        }
        if (query.isActive !== undefined) {
            items = items.filter((item) => item.isActive === query.isActive);
        }
        const totalItems = items.length;
        const paginatedItems = items.slice(params.skip, params.skip + params.limit);
        return pagination_response_dto_1.PaginationResponseBuilder.build(paginatedItems, totalItems, params.page, params.limit);
    }
};
exports.BranchCategoryService = BranchCategoryService;
exports.BranchCategoryService = BranchCategoryService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.BranchCategoryRepository)),
    __metadata("design:paramtypes", [Object])
], BranchCategoryService);
