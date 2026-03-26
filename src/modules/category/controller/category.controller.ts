import type { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { MESSAGES } from '../constants/category.messages';
import type { ICategoryService } from '../service/ICategoryService';
import type {
  CategoryPaginationQueryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  SoftDeleteCategoryDto,
  RestoreCategoryDto,
} from '../dto/category.request.dto';

import { CategoryStatus } from '../constants/category.constants';

@injectable()
export class CategoryController {
  constructor(@inject(TOKENS.CategoryService) private readonly _service: ICategoryService) {}

  async create(req: Request, res: Response): Promise<Response> {
    const dto: CreateCategoryDto = {
      name: req.body.name,
      description: req.body.description,
    };

    const data = await this._service.create(dto);
    return ApiResponse.success(res, data, MESSAGES.CATEGORY.CREATED, HttpStatus.CREATED);
  }

  async update(req: Request, res: Response): Promise<Response> {
    const dto: UpdateCategoryDto = {
      name: req.body.name,
      description: req.body.description,
      status: req.body.status as CategoryStatus,
    };

    const data = await this._service.update(req.params.id, dto);
    return ApiResponse.success(res, data, MESSAGES.CATEGORY.UPDATED);
  }

  async listAdmin(req: Request, res: Response): Promise<Response> {
    const includeDeleted = req.query.includeDeleted === 'true';
    const data = await this._service.list(includeDeleted);
    return ApiResponse.success(res, data, MESSAGES.CATEGORY.LISTED);
  }

  async listPublic(_req: Request, res: Response): Promise<Response> {
    const data = await this._service.list(false);
    const activeOnly = data.filter((c) => !c.isDeleted && c.status === CategoryStatus.ACTIVE);
    return ApiResponse.success(res, activeOnly, MESSAGES.CATEGORY.LISTED);
  }

  async softDelete(req: Request, res: Response): Promise<Response> {
    const dto: SoftDeleteCategoryDto = {
      id: req.params.id,
    };

    const data = await this._service.softDelete(dto);
    return ApiResponse.success(res, data, MESSAGES.CATEGORY.DELETED);
  }

  async restore(req: Request, res: Response): Promise<Response> {
    const dto: RestoreCategoryDto = {
      id: req.params.id,
    };

    const data = await this._service.restore(dto);
    return ApiResponse.success(res, data, MESSAGES.CATEGORY.RESTORED);
  }

  async getPaginatedCategories(req: Request, res: Response): Promise<Response> {
    const query: CategoryPaginationQueryDto = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt',
      sortOrder:
        req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'
          ? req.query.sortOrder
          : 'desc',
      status: Object.values(CategoryStatus).includes(req.query.status as CategoryStatus)
        ? (req.query.status as CategoryStatus)
        : undefined,
      ...(typeof req.query.isDeleted === 'string' && {
        isDeleted: req.query.isDeleted === 'true',
      }),
    };

    const result = await this._service.getPaginatedCategories(query);
    return ApiResponse.success(res, result, MESSAGES.CATEGORY.RETRIEVED_SUCCESSFULLY);
  }
}
