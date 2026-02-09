import type {
  BranchServiceItemResponse,
  BranchServiceStatusResponse,
} from '../mapper/branchService.mapper';
import type {
  UpsertBranchServiceRequestDto,
  ToggleBranchServiceStatusRequestDto,
} from '../dto/branchService.request.dto';
import type { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import type { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';

export interface IBranchServiceService {
  list(branchId: string): Promise<BranchServiceItemResponse[]>;
  upsert(
    branchId: string,
    serviceId: string,
    dto: UpsertBranchServiceRequestDto,
    adminId: string,
  ): Promise<BranchServiceItemResponse>;
  toggleStatus(
    branchId: string,
    serviceId: string,
    dto: ToggleBranchServiceStatusRequestDto,
    adminId: string,
  ): Promise<BranchServiceStatusResponse>;
  listPaginated(
    branchId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<BranchServiceItemResponse>>;
  listPaginatedPublic(
    branchId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<BranchServiceItemResponse>>;

  getDetailsPublic(branchId: string, serviceId: string): Promise<BranchServiceItemResponse>;
}
