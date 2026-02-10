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

@injectable()
export class CategoryController {
  constructor(@inject(TOKENS.CategoryService) private readonly _service: ICategoryService) {}

  async create(req: Request, res: Response) {
    const dto: CreateCategoryDto = {
      name: req.body.name,
      description: req.body.description,
    };

    const data = await this._service.create(dto);

    res.status(HttpStatus.CREATED).json(new ApiResponse(true, MESSAGES.CATEGORY.CREATED, data));
  }

  async update(req: Request, res: Response) {
    const dto: UpdateCategoryDto = {
      name: req.body.name,
      description: req.body.description,
      status: req.body.status,
    };

    const data = await this._service.update(req.params.id, dto);

    res.status(HttpStatus.OK).json(new ApiResponse(true, MESSAGES.CATEGORY.UPDATED, data));
  }

  async listAdmin(req: Request, res: Response) {
    const includeDeleted = req.query.includeDeleted === 'true';
    const data = await this._service.list(includeDeleted);

    res.status(HttpStatus.OK).json(new ApiResponse(true, MESSAGES.CATEGORY.LISTED, data));
  }

  async listPublic(_req: Request, res: Response) {
    const data = await this._service.list(false);
    const activeOnly = data.filter((c) => !c.isDeleted && c.status === 'ACTIVE');

    res.status(HttpStatus.OK).json(new ApiResponse(true, MESSAGES.CATEGORY.LISTED, activeOnly));
  }

  async softDelete(req: Request, res: Response) {
    const dto: SoftDeleteCategoryDto = {
      id: req.params.id,
    };

    const data = await this._service.softDelete(dto);

    res.status(HttpStatus.OK).json(new ApiResponse(true, MESSAGES.CATEGORY.DELETED, data));
  }

  async restore(req: Request, res: Response) {
    const dto: RestoreCategoryDto = {
      id: req.params.id,
    };

    const data = await this._service.restore(dto);

    res.status(HttpStatus.OK).json(new ApiResponse(true, MESSAGES.CATEGORY.RESTORED, data));
  }

  async getPaginatedCategories(req: Request, res: Response) {
    const query: CategoryPaginationQueryDto = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt',
      sortOrder:
        req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'
          ? req.query.sortOrder
          : 'desc',
      status:
        req.query.status === 'ACTIVE' || req.query.status === 'INACTIVE'
          ? req.query.status
          : undefined,
      ...(typeof req.query.isDeleted === 'string' && {
        isDeleted: req.query.isDeleted === 'true',
      }),
    };

    const result = await this._service.getPaginatedCategories(query);

    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, MESSAGES.CATEGORY.RETRIEVED_SUCCESSFULLY, result));
  }
}
