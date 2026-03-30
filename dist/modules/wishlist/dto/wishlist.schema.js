"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistToggleSchema = void 0;
const zod_1 = require("zod");
exports.WishlistToggleSchema = zod_1.z
    .object({
    stylistId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid stylist ID'),
})
    .strict();
