export interface WalletResponseDto {
  userId: string;
  balance: number;
  isActive: boolean;
}

export interface WalletTransactionResponseDto {
  id: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  status: string;
  description: string;
  referenceId?: string;
  referenceType?: string;
  createdAt: string;
}
