export type StylistListResponse = {
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
};
