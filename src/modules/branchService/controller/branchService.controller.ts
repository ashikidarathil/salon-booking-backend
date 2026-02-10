import type { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { ApiResponse } from '../../../common/response/apiResponse';
import { BRANCH_SERVICE_MESSAGES } from '../constants/branchService.messages';
import type { IBranchServiceService } from '../service/IBranchServiceService';
import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';

type AuthReq = Request & { auth?: { userId: string } };

@injectable()
export class BranchServiceController {
  constructor(
    @inject(TOKENS.BranchServiceService)
    private readonly _service: IBranchServiceService,
  ) {}

  list = async (req: Request, res: Response) => {
    const data = await this._service.list(req.params.branchId);
    return res.json(new ApiResponse(true, BRANCH_SERVICE_MESSAGES.LISTED, data));
  };

  upsert = async (req: AuthReq, res: Response) => {
    const data = await this._service.upsert(
      req.params.branchId,
      req.params.serviceId,
      {
        price: Number(req.body.price),
        duration: Number(req.body.duration),
        isActive: req.body.isActive === undefined ? undefined : Boolean(req.body.isActive),
      },
      req.auth!.userId,
    );

    return res.json(new ApiResponse(true, BRANCH_SERVICE_MESSAGES.UPSERTED, data));
  };

  toggleStatus = async (req: AuthReq, res: Response) => {
    const data = await this._service.toggleStatus(
      req.params.branchId,
      req.params.serviceId,
      { isActive: Boolean(req.body.isActive) },
      req.auth!.userId,
    );

    return res.json(new ApiResponse(true, BRANCH_SERVICE_MESSAGES.STATUS_UPDATED, data));
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
      ...(typeof req.query.configured === 'string' && {
        configured: req.query.configured === 'true',
      }),
      ...(typeof req.query.isActive === 'string' && {
        isActive: req.query.isActive === 'true',
      }),
    };

    const data = await this._service.listPaginated(req.params.branchId, query);
    return res.json(new ApiResponse(true, BRANCH_SERVICE_MESSAGES.LISTED, data));
  };

  listPaginatedPublic = async (req: Request, res: Response) => {
    const query: PaginationQueryDto = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 9,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : 'name',
      sortOrder:
        req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'
          ? req.query.sortOrder
          : 'asc',
      ...(typeof req.query.categoryId === 'string' && {
        categoryId: req.query.categoryId,
      }),
    };

    const data = await this._service.listPaginatedPublic(req.params.branchId, query);
    return res.json(new ApiResponse(true, BRANCH_SERVICE_MESSAGES.LISTED, data));
  };

  getDetailsPublic = async (req: Request, res: Response) => {
    const data = await this._service.getDetailsPublic(req.params.branchId, req.params.serviceId);
    return res.json(new ApiResponse(true, BRANCH_SERVICE_MESSAGES.DETAILS_FETCHED, data));
  };
}
