export type StylistInviteEntity = {
  id: string;
  email: string;
  userId: string;
  tokenHash: string;
  rawToken: string;
  inviteLink: string;
  expiresAt: Date;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  usedAt?: Date;
  branchId?: string;
  specialization: string;
  experience: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};
