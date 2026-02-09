import type { CreateStylistInviteRequest } from '../dto/request/CreateStylistInvite.request';
import type { ValidateInviteRequest } from '../dto/request/ValidateInvite.request';
import type { AcceptInviteRequest } from '../dto/request/AcceptInvite.request';
import type { CreateInviteResponse } from '../dto/response/CreateInvite.response';
import type { ValidateInviteResponse } from '../dto/response/ValidateInvite.response';
import type { SendInviteResponse } from '../dto/response/CreateInvite.response';

export interface IStylistInviteService {
  createInvite(adminId: string, dto: CreateStylistInviteRequest): Promise<CreateInviteResponse>;
  validateInvite(dto: ValidateInviteRequest): Promise<ValidateInviteResponse>;

  acceptInvite(dto: AcceptInviteRequest, tabId?: string): Promise<{ success: true }>;
  approveStylist(adminId: string, userId: string): Promise<{ success: true }>;
  rejectStylist(adminId: string, userId: string): Promise<{ success: true }>;
  toggleBlock(adminId: string, userId: string, block: boolean): Promise<{ success: true }>;
  sendInviteToAppliedStylist(adminId: string, userId: string): Promise<SendInviteResponse>;
}
