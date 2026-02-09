export interface StylistEntity {
  id: string;
  userId: string;
  specialization: string;
  experience: number;
  rating: number;
  status: 'ACTIVE' | 'INACTIVE';
  profilePicture?: string;
  allowChat: boolean;
  earningsBalance: number;
  pendingPayout: number;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
