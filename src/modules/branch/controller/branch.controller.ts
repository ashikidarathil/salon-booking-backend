import type { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { ApiResponse } from '../../../common/response/apiResponse';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import { BRANCH_MESSAGES } from '../constants/branch.messages';
import type { IBranchService } from '../service/IBranchService';
import type { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import type { CreateBranchDto, UpdateBranchDto } from '../dto/branch.request.dto';
import type { GetNearestBranchesDto } from '../dto/GetNearestBranches.dto';

@injectable()
export class BranchController {
  constructor(
    @inject(TOKENS.BranchService)
    private readonly service: IBranchService,
  ) {}

  create = async (req: Request, res: Response) => {
    const dto: CreateBranchDto = {
      name: req.body.name,
      address: req.body.address,
      phone: req.body.phone,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    };

    const data = await this.service.create(dto);
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
    const dto: UpdateBranchDto = {
      name: req.body.name,
      address: req.body.address,
      phone: req.body.phone,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    };

    const data = await this.service.update(req.params.id, dto);
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
      .json(new ApiResponse(true, BRANCH_MESSAGES.RETRIEVED_SUCCESSFULLY, result));
  };

  getNearestBranches = async (req: Request, res: Response) => {
    const dto: GetNearestBranchesDto = {
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      maxDistance: req.body.maxDistance,
    };

    const data = await this.service.getNearestBranches(
      dto.latitude,
      dto.longitude,
      dto.maxDistance,
    );
    return res.json(new ApiResponse(true, BRANCH_MESSAGES.NEAREST_FOUND, data));
  };

  listPublic = async (req: Request, res: Response) => {
    const branches = await this.service.listPublic();
    return res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, BRANCH_MESSAGES.FETCHED_SUCCESSFULLY, branches));
  };

  getPublic = async (req: Request, res: Response) => {
    const { id } = req.params;
    const branch = await this.service.getPublic(id);
    return res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, BRANCH_MESSAGES.FETCHED_SUCCESSFULLY, branch));
  };

  listPublicPaginated = async (req: Request, res: Response) => {
    const query: PaginationQueryDto = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt',
      sortOrder:
        req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'
          ? req.query.sortOrder
          : 'desc',
      isDeleted: false,
    };

    const result = await this.service.getPaginatedBranches(query);

    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(true, BRANCH_MESSAGES.RETRIEVED_SUCCESSFULLY, result));
  };
}
