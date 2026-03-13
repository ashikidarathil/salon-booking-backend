export interface CreditWalletDto {
  amount: number;
  description: string;
}

export interface CreateTopupOrderDto {
  amount: number;
}

export interface VerifyTopupDto {
  orderId: string;
  paymentId: string;
  signature: string;
}
