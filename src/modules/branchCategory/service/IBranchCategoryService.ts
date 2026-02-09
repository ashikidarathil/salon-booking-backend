import type { ToggleBranchCategoryRequestDto } from '../dto/branchCategory.request.dto';
import type { BranchCategoryItemResponse } from '../mapper/branchCategory.mapper';
import type { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import type { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';

export interface IBranchCategoryService {
  list(branchId: string): Promise<BranchCategoryItemResponse[]>;
  toggle(
    branchId: string,
    categoryId: string,
    dto: ToggleBranchCategoryRequestDto,
    adminId: string,
  ): Promise<BranchCategoryItemResponse>;
  listPaginated(
    branchId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<BranchCategoryItemResponse>>;
}
