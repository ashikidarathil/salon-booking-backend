import type {
  AssignStylistToBranchRequestDto,
  UnassignStylistFromBranchRequestDto,
  ChangeStylistBranchRequestDto,
} from '../dto/stylistBranch.request.dto';

import type {
  BranchStylistItemDto,
  UnassignedStylistOptionDto,
} from '../dto/stylistBranch.response.dto';
import type { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import type { PaginatedResponse } from '../../../common/dto/pagination.response.dto';

export interface IStylistBranchService {
  listBranchStylists(branchId: string): Promise<BranchStylistItemDto[]>;
  listUnassignedOptions(branchId: string): Promise<UnassignedStylistOptionDto[]>;

  listBranchStylistsPaginated(
    branchId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<BranchStylistItemDto>>;

  listUnassignedOptionsPaginated(
    branchId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<UnassignedStylistOptionDto>>;

  assign(
    branchId: string,
    dto: AssignStylistToBranchRequestDto,
    adminId: string,
  ): Promise<BranchStylistItemDto>;
  unassign(branchId: string, dto: UnassignStylistFromBranchRequestDto): Promise<{ success: true }>;

  changeBranch(
    branchId: string,
    dto: ChangeStylistBranchRequestDto,
    adminId: string,
  ): Promise<BranchStylistItemDto>;
}
