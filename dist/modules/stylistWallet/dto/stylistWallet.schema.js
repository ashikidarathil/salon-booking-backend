"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetStylistWalletSchema = void 0;
const zod_1 = require("zod");
exports.GetStylistWalletSchema = zod_1.z.object({
    stylistId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid stylist ID format'),
});
