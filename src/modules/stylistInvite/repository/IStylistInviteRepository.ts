import { StylistInviteEntity } from '../type/StylistInviteEntity';
import { CreateInviteInput } from '../type/CreateInviteInput';

export interface IStylistInviteRepository {
  createInvite(data: CreateInviteInput): Promise<StylistInviteEntity>;
  findPendingByTokenHash(tokenHash: string): Promise<StylistInviteEntity | null>;
  findLatestByUserIds(userIds: string[]): Promise<Record<string, StylistInviteEntity | undefined>>;
  cancelByUserId(userId: string): Promise<void>;
  markAccepted(inviteId: string): Promise<void>;
  markExpired(inviteId: string): Promise<void>;
}
