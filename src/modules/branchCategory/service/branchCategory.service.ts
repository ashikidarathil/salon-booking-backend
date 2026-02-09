import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';

import { BRANCH_CATEGORY_MESSAGES } from '../constants/branchCategory.messages';
import type { IBranchCategoryService } from './IBranchCategoryService';
import type { IBranchCategoryRepository } from '../repository/IBranchCategoryRepository';
import type { ToggleBranchCategoryRequestDto } from '../dto/branchCategory.request.dto';
import { BranchCategoryMapper } from '../mapper/branchCategory.mapper';

import { CategoryModel } from '../../../models/category.model';
import { CategoryLean } from '../type/categoryLean.types';

import type { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import { PaginationQueryParser } from '../../../common/dto/pagination.query.dto';
import {
  PaginatedResponse,
  PaginationResponseBuilder,
} from '../../../common/dto/pagination.response.dto';
import { BranchCategoryItemResponse } from '../mapper/branchCategory.mapper';

@injectable()
export class BranchCategoryService implements IBranchCategoryService {
  constructor(
    @inject(TOKENS.BranchCategoryRepository)
    private readonly _repo: IBranchCategoryRepository,
  ) {}

  async list(branchId: string) {
    if (!branchId) {
      throw new AppError(BRANCH_CATEGORY_MESSAGES.BRANCH_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const categories = (await CategoryModel.find()
      .select('name isDeleted')
      .lean()) as CategoryLean[];

    const mappings = await this._repo.findByBranchId(branchId);

    const activeMap = new Map<string, boolean>();
    for (const m of mappings) activeMap.set(m.categoryId.toString(), m.isActive);

    return categories
      .filter((c) => !c.isDeleted)
      .map((c) =>
        BranchCategoryMapper.toItem({
          branchId,
          categoryId: String(c._id),
          name: c.name,
          isActive: activeMap.get(String(c._id)) ?? false,
        }),
      );
  }

  async toggle(
    branchId: string,
    categoryId: string,
    dto: ToggleBranchCategoryRequestDto,
    adminId: string,
  ) {
    if (!branchId) {
      throw new AppError(BRANCH_CATEGORY_MESSAGES.BRANCH_REQUIRED, HttpStatus.BAD_REQUEST);
    }
    if (!categoryId) {
      throw new AppError(BRANCH_CATEGORY_MESSAGES.CATEGORY_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const doc = await this._repo.upsert(branchId, categoryId, dto.isActive, adminId);

    const category = (await CategoryModel.findById(categoryId).select('name').lean()) as {
      name?: string;
    } | null;

    return BranchCategoryMapper.toItem({
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

  async listPaginated(
    branchId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<BranchCategoryItemResponse>> {
    if (!branchId) {
      throw new AppError(BRANCH_CATEGORY_MESSAGES.BRANCH_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const { params, search } = PaginationQueryParser.parse(query);

    const categories = await this._repo.findAllCategories();
    const mappings = await this._repo.findByBranchId(branchId);

    const activeMap = new Map<string, boolean>();
    for (const m of mappings) {
      activeMap.set(m.categoryId.toString(), m.isActive);
    }

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

    if (query.isActive !== undefined) {
      items = items.filter((item) => item.isActive === query.isActive);
    }

    const totalItems = items.length;
    const paginatedItems = items.slice(params.skip, params.skip + params.limit);

    return PaginationResponseBuilder.build(paginatedItems, totalItems, params.page, params.limit);
  }
}
