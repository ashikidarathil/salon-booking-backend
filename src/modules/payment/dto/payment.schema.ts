import { z } from 'zod';

export const CreateOrderSchema = z
  .object({
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID'),
  })
  .strict();

export const PaymentVerificationSchema = z
  .object({
    orderId: z.string().min(1, 'Order ID is required'),
    paymentId: z.string().min(1, 'Payment ID is required'),
    signature: z.string().min(1, 'Signature is required'),
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID'),
  })
  .strict();

export const PayWithWalletSchema = z
  .object({
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID'),
  })
  .strict();

export const CreateRemainingOrderSchema = z
  .object({
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID'),
  })
  .strict();

export const PayRemainingWithWalletSchema = z
  .object({
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID'),
  })
  .strict();
