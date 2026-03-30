"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyTopupSchema = exports.CreateTopupOrderSchema = exports.CreditWalletSchema = void 0;
const zod_1 = require("zod");
exports.CreditWalletSchema = zod_1.z
    .object({
    amount: zod_1.z.number().positive('Amount must be greater than 0'),
    description: zod_1.z.string().min(1, 'Description is required'),
})
    .strict();
exports.CreateTopupOrderSchema = zod_1.z
    .object({
    amount: zod_1.z.number().positive('Amount must be greater than 0'),
})
    .strict();
exports.VerifyTopupSchema = zod_1.z
    .object({
    orderId: zod_1.z.string().min(1, 'Order ID is required'),
    paymentId: zod_1.z.string().min(1, 'Payment ID is required'),
    signature: zod_1.z.string().min(1, 'Signature is required'),
})
    .strict();
