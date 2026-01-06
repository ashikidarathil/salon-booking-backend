import { CreateStylistInput } from '../type/CreateStylistInput';

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
  inviteStatus?: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
}

export type StylistDraft = {
  branchId?: string;
  specialization: string;
  experience: number;
};

export interface IStylistRepository {
  existsByUserId(userId: string): Promise<boolean>;
  createStylistDraft(data: CreateStylistInput): Promise<void>;
  activateByUserId(userId: string): Promise<void>;
  listAll(): Promise<StylistListItem[]>;
  getDraftByUserId(userId: string): Promise<StylistDraft | null>;
}
