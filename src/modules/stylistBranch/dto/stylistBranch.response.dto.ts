import type { StylistStatus } from '../../stylistInvite/constants/stylist.enum';

export interface BranchStylistItemDto {
  mappingId: string;
  branchId: string;

  stylistId: string;
  userId: string;

  name: string;
  email?: string;
  phone?: string;

  specialization: string;
  experience: number;
  stylistStatus: StylistStatus;

  assignedAt: string;
}

export interface UnassignedStylistOptionDto {
  stylistId: string;
  userId: string;

  name: string;
  email?: string;
  phone?: string;

  specialization: string;
  experience: number;
  stylistStatus: StylistStatus;
}
