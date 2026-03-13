export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number | string;
  amount_paid: number | string;
  amount_due: number | string;
  currency: string;
  receipt?: string;
  status: string;
  attempts: number;
  notes?: Record<string, string | number | null>;
  created_at: number;
}

export interface IRazorpayService {
  createOrder(amount: number, currency: string, receipt: string): Promise<RazorpayOrder>;
  verifySignature(orderId: string, paymentId: string, signature: string): boolean;
}
