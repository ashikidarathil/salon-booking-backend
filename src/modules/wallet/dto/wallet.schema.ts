import { z } from 'zod';

export const CreditWalletSchema = z
  .object({
    amount: z.number().positive('Amount must be greater than 0'),
    description: z.string().min(1, 'Description is required'),
  })
  .strict();

export const CreateTopupOrderSchema = z
  .object({
    amount: z.number().positive('Amount must be greater than 0'),
  })
  .strict();

export const VerifyTopupSchema = z
  .object({
    orderId: z.string().min(1, 'Order ID is required'),
    paymentId: z.string().min(1, 'Payment ID is required'),
    signature: z.string().min(1, 'Signature is required'),
  })
  .strict();
