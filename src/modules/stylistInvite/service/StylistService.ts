import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import type { IStylistService } from './IStylistService';
import type { IStylistRepository } from '../repository/IStylistRepository';
import type { IStylistInviteRepository } from '../repository/IStylistInviteRepository';
import { StylistMapper } from '../mapper/StylistInviteMapper';
import type { StylistListResponse } from '../dto/response/StylistList.response';
import type { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import type { PaginatedResponse } from '../../../common/dto/pagination.response.dto';
import type { StylistListItem } from '../repository/IStylistRepository';

@injectable()
export class StylistService implements IStylistService {
  constructor(
    @inject(TOKENS.StylistRepository) private readonly _stylistRepo: IStylistRepository,
    @inject(TOKENS.StylistInviteRepository) private readonly _inviteRepo: IStylistInviteRepository,
  ) {}

  async listAllWithInviteStatus(): Promise<StylistListResponse[]> {
    const list = await this._stylistRepo.listAll();
    const inviteMap = await this._inviteRepo.findLatestByUserIds(list.map((x) => x.userId));

    const merged = list.map((stylist) => {
      if (stylist.status === 'ACTIVE') {
        return { ...stylist, inviteStatus: 'ACCEPTED' as const };
      }

      return { ...stylist, inviteStatus: inviteMap[stylist.userId]?.status };
    });

    return StylistMapper.toListResponseArray(merged);
  }

  async getPaginatedStylists(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<StylistListItem>> {
    return this._stylistRepo.getPaginatedStylists(query);
  }

  async toggleBlockStylist(stylistId: string, isBlocked: boolean): Promise<StylistListItem | null> {
    return this._stylistRepo.setBlockedById(stylistId, isBlocked);
  }

  async updateStylistPosition(
    stylistId: string,
    position: 'JUNIOR' | 'SENIOR' | 'TRAINEE',
  ): Promise<StylistListItem | null> {
    return this._stylistRepo.updatePosition(stylistId, position);
  }

  async getPublicStylists(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<StylistListItem>> {
    const publicQuery: PaginationQueryDto = {
      ...query,
      status: 'ACTIVE',
      isBlocked: false,
      isActive: true,
    };
    return this._stylistRepo.getPaginatedStylists(publicQuery);
  }

  async getPublicStylistById(stylistId: string): Promise<StylistListItem | null> {
    const stylist = await this._stylistRepo.getById(stylistId);
    if (!stylist || stylist.status !== 'ACTIVE' || stylist.isBlocked) {
      return null;
    }
    return stylist;
  }
}
