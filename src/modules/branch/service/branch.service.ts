import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import { BranchMapper } from '../mapper/branch.mapper';
import { BRANCH_MESSAGES } from '../constants/branch.messages';
import { AppError } from '../../../common/errors/appError';
import { HttpStatus } from '../../../common/enums/httpStatus.enum';
import type { IBranchService } from './IBranchService';
import type { IBranchRepository } from '../repository/IBranchRepository';
import type { CreateBranchDto, UpdateBranchDto } from '../dto/branch.request.dto';
import type { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import type { BranchResponseDto } from '../dto/branch.response.dto';
import type { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import { BranchWithDistanceDto } from '../dto/branch.response.dto';

@injectable()
export class BranchService implements IBranchService {
  constructor(
    @inject(TOKENS.BranchRepository)
    private readonly repo: IBranchRepository,
  ) {}

  async create(dto: CreateBranchDto) {
    const branch = await this.repo.create(dto);
    return BranchMapper.toResponse(branch);
  }

  async list(includeDeleted = false) {
    const branches = await this.repo.findAll(includeDeleted);
    return branches.map((b) => BranchMapper.toResponse(b));
  }

  async update(id: string, dto: UpdateBranchDto) {
    const branch = await this.repo.update(id, dto);
    if (!branch) throw new AppError(BRANCH_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    return BranchMapper.toResponse(branch);
  }

  async disable(id: string) {
    const branch = await this.repo.disable(id);
    if (!branch) throw new AppError(BRANCH_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    return BranchMapper.toResponse(branch);
  }

  async restore(id: string) {
    const branch = await this.repo.restore(id);
    if (!branch) throw new AppError(BRANCH_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    return BranchMapper.toResponse(branch);
  }
  async getPaginatedBranches(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<BranchResponseDto>> {
    return this.repo.getPaginatedBranches(query);
  }
  async getNearestBranches(
    latitude: number,
    longitude: number,
    maxDistance = 50000,
  ): Promise<BranchWithDistanceDto[]> {
    return this.repo.findNearestBranches(latitude, longitude, maxDistance);
  }

  async listPublic(): Promise<BranchResponseDto[]> {
    const branches = await this.repo.findAll(false);
    return branches.map((branch) => BranchMapper.toResponse(branch));
  }

  async getPublic(id: string): Promise<BranchResponseDto> {
    const branch = await this.repo.findById(id);

    if (!branch || branch.isDeleted) {
      throw new AppError(BRANCH_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return BranchMapper.toResponse(branch);
  }
}
