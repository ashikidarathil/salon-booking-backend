export interface UserListItemDto {
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  isBlocked: boolean;
  createdAt: Date;
  role: 'USER' | 'ADMIN' | 'STYLIST';
}

export interface GetAllUsersResponseDto {
  users: UserListItemDto[];
  total: number;
}
