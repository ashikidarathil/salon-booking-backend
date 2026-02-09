import { CreateStylistInput } from '../type/CreateStylistInput';
import type { PaginationQueryDto } from '../../../common/dto/pagination.query.dto';
import type { PaginatedResponse } from '../../../common/dto/pagination.response.dto';

export interface StylistListItem {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  specialization: string;
  experience: number;
  status: 'ACTIVE' | 'INACTIVE';
  isBlocked: boolean;
  userStatus?: 'APPLIED' | 'PENDING' | 'ACTIVE' | 'REJECTED' | 'EXPIRED' | 'ACCEPTED';
  inviteStatus?: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  inviteExpiresAt?: string;
  inviteLink?: string;
}

export type StylistDraft = {
  specialization: string;
  experience: number;
};

export interface IStylistRepository {
  existsByUserId(userId: string): Promise<boolean>;
  createStylistDraft(data: CreateStylistInput): Promise<void>;
  activateByUserId(userId: string): Promise<void>;
  listAll(): Promise<StylistListItem[]>;
  getDraftByUserId(userId: string): Promise<StylistDraft | null>;
  getPaginatedStylists(query: PaginationQueryDto): Promise<PaginatedResponse<StylistListItem>>;
  setBlockedById(stylistId: string, isBlocked: boolean): Promise<StylistListItem | null>;
}
