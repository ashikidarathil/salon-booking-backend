export interface StylistWalletResponseDto {
  _id: string;
  stylistId: string;
  withdrawableBalance: number;
  pendingWithdrawal: number;
  totalEarnings: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
