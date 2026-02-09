import type { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { ApiResponse } from '../../../common/response/apiResponse';
import { BRANCH_CATEGORY_MESSAGES } from '../constants/branchCategory.messages';
import type { IBranchCategoryService } from '../service/IBranchCategoryService';
import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';

type AuthReq = Request & { auth?: { userId: string } };

@injectable()
export class BranchCategoryController {
  constructor(
    @inject(TOKENS.BranchCategoryService)
    private readonly service: IBranchCategoryService,
  ) {}

  list = async (req: Request, res: Response) => {
    const data = await this.service.list(req.params.branchId);
    return res.json(new ApiResponse(true, BRANCH_CATEGORY_MESSAGES.LISTED, data));
  };

  toggle = async (req: AuthReq, res: Response) => {
    const data = await this.service.toggle(
      req.params.branchId,
      req.params.categoryId,
      { isActive: Boolean(req.body.isActive) },
      req.auth!.userId,
    );

    return res.json(new ApiResponse(true, BRANCH_CATEGORY_MESSAGES.UPDATED, data));
  };
  listPaginated = async (req: Request, res: Response) => {
    const query: PaginationQueryDto = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : 'name',
      sortOrder:
        req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'
          ? req.query.sortOrder
          : 'asc',
      ...(typeof req.query.isActive === 'string' && {
        isActive: req.query.isActive === 'true',
      }),
    };

    const data = await this.service.listPaginated(req.params.branchId, query);
    return res.json(new ApiResponse(true, BRANCH_CATEGORY_MESSAGES.LISTED, data));
  };
}
