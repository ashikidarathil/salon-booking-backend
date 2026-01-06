import type { StylistListItem } from '../repository/IStylistRepository';

export interface IStylistService {
  listAllWithInviteStatus(): Promise<StylistListItem[]>;
}
