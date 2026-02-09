import type { CreateBranchDto, UpdateBranchDto } from '../dto/branch.request.dto';
import type { BranchResponseDto } from '../dto/branch.response.dto';
import type { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import type { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import { BranchWithDistanceDto } from '../dto/branch.response.dto';

export interface IBranchService {
  create(dto: CreateBranchDto): Promise<BranchResponseDto>;
  list(includeDeleted?: boolean): Promise<BranchResponseDto[]>;
  update(id: string, dto: UpdateBranchDto): Promise<BranchResponseDto>;
  disable(id: string): Promise<BranchResponseDto>;
  restore(id: string): Promise<BranchResponseDto>;
  getPaginatedBranches(query: PaginationQueryDto): Promise<PaginatedResponse<BranchResponseDto>>;
  getNearestBranches(
    latitude: number,
    longitude: number,
    maxDistance?: number,
  ): Promise<BranchWithDistanceDto[]>;
  listPublic(): Promise<BranchResponseDto[]>;
  getPublic(id: string): Promise<BranchResponseDto>;
}
