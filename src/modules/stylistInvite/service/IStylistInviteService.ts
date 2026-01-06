import type { CreateStylistInviteDto } from '../dto/CreateStylistInvite.dto';
import type { ValidateInviteDto } from '../dto/ValidateInvite.dto';
import type { AcceptInviteDto } from '../dto/AcceptInvite.dto';

export interface IStylistInviteService {
  createInvite(
    adminId: string,
    dto: CreateStylistInviteDto,
  ): Promise<{ inviteLink: string; userId: string }>;
  validateInvite(dto: ValidateInviteDto): Promise<{
    email: string;
    branchId?: string;
    specialization: string;
    experience: number;
    expiresAt: Date;
  }>;
  acceptInvite(dto: AcceptInviteDto, tabId?: string): Promise<{ success: true }>;
  approveStylist(adminId: string, userId: string): Promise<{ success: true }>;
  rejectStylist(adminId: string, userId: string): Promise<{ success: true }>;
  toggleBlock(adminId: string, userId: string, block: boolean): Promise<{ success: true }>;
  sendInviteToAppliedStylist(adminId: string, userId: string): Promise<{ inviteLink: string }>;
}
