export interface WishlistToggleRequestDto {
  stylistId: string;
}

export interface WishlistResponseDto {
  id: string;
  userId: string;
  stylistId: string;
  createdAt: string;
  updatedAt: string;
}
