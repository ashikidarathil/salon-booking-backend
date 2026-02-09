export type CreateInviteInput = {
  email: string;
  userId: string;
  tokenHash: string;
  rawToken: string;
  inviteLink: string;
  expiresAt: Date;
  specialization: string;
  experience: number;
  createdBy: string;
};
