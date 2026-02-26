import type { StylistListResponse } from '../dto/response/StylistList.response';
import type { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import type { StylistListItem } from '../repository/IStylistRepository';
import type { PaginatedResponse } from '../../../common/dto/pagination.response.dto';

export interface IStylistService {
  listAllWithInviteStatus(): Promise<StylistListResponse[]>;
  getPaginatedStylists(query: PaginationQueryDto): Promise<PaginatedResponse<StylistListItem>>;
  toggleBlockStylist(stylistId: string, isBlocked: boolean): Promise<StylistListItem | null>;
  updateStylistPosition(
    stylistId: string,
    position: 'JUNIOR' | 'SENIOR' | 'TRAINEE',
  ): Promise<StylistListItem | null>;
  getPublicStylists(
    query: PaginationQueryDto,
    userId?: string,
  ): Promise<PaginatedResponse<StylistListItem>>;
  getPublicStylistById(stylistId: string, userId?: string): Promise<StylistListItem | null>;
}
