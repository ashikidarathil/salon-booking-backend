import type { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import type { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import {
  ToggleStylistServiceStatusRequestDto,
  StylistServiceItemResponseDto,
  StylistByServiceResponseDto,
} from '../dto/stylistService.dto';

export interface IStylistServiceService {
  list(stylistId: string, branchId?: string): Promise<StylistServiceItemResponseDto[]>;
  toggleStatus(
    stylistId: string,
    serviceId: string,
    dto: ToggleStylistServiceStatusRequestDto,
    adminId: string,
  ): Promise<{ stylistId: string; serviceId: string; isActive: boolean }>;
  listPaginated(
    stylistId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<StylistServiceItemResponseDto>>;
  getStylistsByService(serviceId: string): Promise<StylistByServiceResponseDto[]>;
}
