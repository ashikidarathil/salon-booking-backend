import type { CreateBranchDto, UpdateBranchDto } from '../dto/branch.request.dto';
import type { BranchDocument } from '../../../models/branch.model';
import type { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import type { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import type { BranchResponseDto } from '../dto/branch.response.dto';
import { BranchWithDistanceDto } from '../dto/branch.response.dto';

export interface IBranchRepository {
  create(data: CreateBranchDto): Promise<BranchDocument>;
  findAll(includeDeleted?: boolean): Promise<BranchDocument[]>;
  findById(id: string): Promise<BranchDocument | null>;
  update(id: string, data: UpdateBranchDto): Promise<BranchDocument | null>;
  disable(id: string): Promise<BranchDocument | null>;
  restore(id: string): Promise<BranchDocument | null>;
  getPaginatedBranches(query: PaginationQueryDto): Promise<PaginatedResponse<BranchResponseDto>>;
  findNearestBranches(
    latitude: number,
    longitude: number,
    maxDistance?: number,
  ): Promise<BranchWithDistanceDto[]>;
}
