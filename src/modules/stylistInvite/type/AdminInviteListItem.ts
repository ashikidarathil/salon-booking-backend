export type AdminInviteListItem = {
  id: string;
  email: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: Date;
  usedAt?: Date;
  specialization: string;
  experience: number;
  branchId?: string;
  createdAt: Date;
};
