import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../common/di/tokens';
import type { IStylistService } from './IStylistService';
import type { IStylistRepository } from '../repository/IStylistRepository';
import type { IStylistInviteRepository } from '../repository/IStylistInviteRepository';
import type { StylistListItem } from '../repository/IStylistRepository';

@injectable()
export class StylistService implements IStylistService {
  constructor(
    @inject(TOKENS.StylistRepository) private readonly _stylistRepo: IStylistRepository,
    @inject(TOKENS.StylistInviteRepository) private readonly _inviteRepo: IStylistInviteRepository,
  ) {}

  async listAllWithInviteStatus(): Promise<StylistListItem[]> {
    const list = await this._stylistRepo.listAll();
    const inviteMap = await this._inviteRepo.findLatestByUserIds(list.map((x) => x.userId));

    return list.map((s) => {
      if (s.status === 'ACTIVE') {
        return {
          ...s,
          inviteStatus: 'ACCEPTED',
        };
      }

      return {
        ...s,
        inviteStatus: inviteMap[s.userId]?.status,
      };
    });
  }
}
