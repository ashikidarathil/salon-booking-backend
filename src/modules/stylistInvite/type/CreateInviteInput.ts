export type CreateInviteInput = {
  email: string;
  userId: string;
  tokenHash: string;
  rawToken: string;
  inviteLink: string;
  expiresAt: Date;
  branchId?: string;
  specialization: string;
  experience: number;
  createdBy: string;
};
