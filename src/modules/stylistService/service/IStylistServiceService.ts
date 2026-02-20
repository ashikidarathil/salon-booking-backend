import type { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import type { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import { StylistServiceItemResponse } from '../mapper/stylistService.mapper';
import { ToggleStylistServiceStatusRequestDto } from '../dto/stylistService.request.dto';

export interface IStylistServiceService {
  list(stylistId: string): Promise<StylistServiceItemResponse[]>;
  toggleStatus(
    stylistId: string,
    serviceId: string,
    dto: ToggleStylistServiceStatusRequestDto,
    adminId: string,
  ): Promise<any>;
  listPaginated(
    stylistId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<StylistServiceItemResponse>>;
}
