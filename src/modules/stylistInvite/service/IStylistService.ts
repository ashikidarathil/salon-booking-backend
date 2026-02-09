import type { StylistListResponse } from '../dto/response/StylistList.response';
import type { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import type { StylistListItem } from '../repository/IStylistRepository';
import type { PaginatedResponse } from '../../../common/dto/pagination.response.dto';

export interface IStylistService {
  listAllWithInviteStatus(): Promise<StylistListResponse[]>;
  getPaginatedStylists(query: PaginationQueryDto): Promise<PaginatedResponse<StylistListItem>>;
  toggleBlockStylist(stylistId: string, isBlocked: boolean): Promise<StylistListItem | null>;
}
