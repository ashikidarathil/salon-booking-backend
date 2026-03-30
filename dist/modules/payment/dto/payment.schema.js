"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayRemainingWithWalletSchema = exports.CreateRemainingOrderSchema = exports.PayWithWalletSchema = exports.PaymentVerificationSchema = exports.CreateOrderSchema = void 0;
const zod_1 = require("zod");
exports.CreateOrderSchema = zod_1.z
    .object({
    bookingId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID'),
})
    .strict();
exports.PaymentVerificationSchema = zod_1.z
    .object({
    orderId: zod_1.z.string().min(1, 'Order ID is required'),
    paymentId: zod_1.z.string().min(1, 'Payment ID is required'),
    signature: zod_1.z.string().min(1, 'Signature is required'),
    bookingId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID'),
})
    .strict();
exports.PayWithWalletSchema = zod_1.z
    .object({
    bookingId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID'),
})
    .strict();
exports.CreateRemainingOrderSchema = zod_1.z
    .object({
    bookingId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID'),
})
    .strict();
exports.PayRemainingWithWalletSchema = zod_1.z
    .object({
    bookingId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID'),
})
    .strict();
