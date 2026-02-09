import type { Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { STYLIST_BRANCH_MESSAGES } from '../constants/stylistBranch.messages';
import type { IStylistBranchService } from '../service/IStylistBranchService';
import type { AuthenticatedRequest } from '../../../common/types/express';
import { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';

@injectable()
export class StylistBranchController {
  constructor(
    @inject(TOKENS.StylistBranchService)
    private readonly _service: IStylistBranchService,
  ) {}

  list = async (req: AuthenticatedRequest, res: Response) => {
    const { branchId } = req.params;
    const data = await this._service.listBranchStylists(branchId);
    return res.json(new ApiResponse(true, STYLIST_BRANCH_MESSAGES.LISTED, data));
  };

  options = async (req: AuthenticatedRequest, res: Response) => {
    const { branchId } = req.params;
    const data = await this._service.listUnassignedOptions(branchId);
    return res.json(new ApiResponse(true, STYLIST_BRANCH_MESSAGES.OPTIONS_LISTED, data));
  };

  assign = async (req: AuthenticatedRequest, res: Response) => {
    const { branchId } = req.params;
    const adminId = req.auth?.userId as string;

    const data = await this._service.assign(
      branchId,
      { stylistId: String(req.body.stylistId || '') },
      adminId,
    );
    return res
      .status(HttpStatus.CREATED)
      .json(new ApiResponse(true, STYLIST_BRANCH_MESSAGES.ASSIGNED, data));
  };

  unassign = async (req: AuthenticatedRequest, res: Response) => {
    const { branchId } = req.params;
    const data = await this._service.unassign(branchId, {
      stylistId: String(req.body.stylistId || ''),
    });
    return res.json(new ApiResponse(true, STYLIST_BRANCH_MESSAGES.UNASSIGNED, data));
  };

  changeBranch = async (req: AuthenticatedRequest, res: Response) => {
    const { branchId } = req.params;
    const adminId = req.auth?.userId as string;

    const data = await this._service.changeBranch(
      branchId,
      { stylistId: String(req.body.stylistId || '') },
      adminId,
    );
    return res.json(new ApiResponse(true, STYLIST_BRANCH_MESSAGES.CHANGED, data));
  };
  listPaginated = async (req: AuthenticatedRequest, res: Response) => {
    const { branchId } = req.params;
    const query: PaginationQueryDto = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt',
      sortOrder:
        req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'
          ? req.query.sortOrder
          : 'desc',
    };

    const data = await this._service.listBranchStylistsPaginated(branchId, query);
    return res.json(new ApiResponse(true, STYLIST_BRANCH_MESSAGES.LISTED, data));
  };

  optionsPaginated = async (req: AuthenticatedRequest, res: Response) => {
    const { branchId } = req.params;
    const query: PaginationQueryDto = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt',
      sortOrder:
        req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'
          ? req.query.sortOrder
          : 'desc',
    };

    const data = await this._service.listUnassignedOptionsPaginated(branchId, query);
    return res.json(new ApiResponse(true, STYLIST_BRANCH_MESSAGES.OPTIONS_LISTED, data));
  };
}
