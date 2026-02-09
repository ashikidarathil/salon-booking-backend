import type { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { BRANCH_MESSAGES } from '../constants/branch.messages';
import type { IBranchService } from '../service/IBranchService';
import type { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';

@injectable()
export class BranchController {
  constructor(
    @inject(TOKENS.BranchService)
    private readonly service: IBranchService,
  ) {}

  create = async (req: Request, res: Response) => {
    const data = await this.service.create(req.body);
    return res
      .status(HttpStatus.CREATED)
      .json(new ApiResponse(true, BRANCH_MESSAGES.CREATED, data));
  };

  list = async (req: Request, res: Response) => {
    const includeDeleted = req.query.includeDeleted === 'true';
    const data = await this.service.list(includeDeleted);
    return res.json(new ApiResponse(true, BRANCH_MESSAGES.LISTED, data));
  };

  update = async (req: Request, res: Response) => {
    const data = await this.service.update(req.params.id, req.body);
    return res.json(new ApiResponse(true, BRANCH_MESSAGES.UPDATED, data));
  };

  disable = async (req: Request, res: Response) => {
    const data = await this.service.disable(req.params.id);
    return res.json(new ApiResponse(true, BRANCH_MESSAGES.DISABLED, data));
  };

  restore = async (req: Request, res: Response) => {
    const data = await this.service.restore(req.params.id);
    return res.json(new ApiResponse(true, BRANCH_MESSAGES.RESTORED, data));
  };

  getPaginatedBranches = async (req: Request, res: Response) => {
    const query: PaginationQueryDto = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt',
      sortOrder:
        req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'
          ? req.query.sortOrder
          : 'desc',
      ...(typeof req.query.isDeleted === 'string' && {
        isDeleted: req.query.isDeleted === 'true',
      }),
    };

    const result = await this.service.getPaginatedBranches(query);

    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, 'Branches retrieved successfully', result));
  };

  getNearestBranches = async (req: Request, res: Response) => {
    const { latitude, longitude, maxDistance } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponse<void>(false, 'latitude and longitude are required'));
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponse<void>(false, 'latitude and longitude must be numbers'));
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponse<void>(false, 'Invalid coordinates'));
    }

    try {
      const data = await this.service.getNearestBranches(latitude, longitude, maxDistance);
      return res.json(new ApiResponse(true, 'Nearest branches found', data));
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponse<void>(false, error instanceof Error ? error.message : 'Error'));
    }
  };

  listPublic = async (req: Request, res: Response) => {
    try {
      const branches = await this.service.listPublic();
      return res.status(200).json(new ApiResponse(true, 'Branches fetched successfully', branches));
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponse<void>(false, error instanceof Error ? error.message : 'Error'));
    }
  };

  getPublic = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const branch = await this.service.getPublic(id);
      return res.status(200).json(new ApiResponse(true, 'Branch fetched successfully', branch));
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponse<void>(false, error instanceof Error ? error.message : 'Error'));
    }
  };
}
