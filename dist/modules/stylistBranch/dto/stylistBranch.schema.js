"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeBranchSchema = exports.UnassignStylistSchema = exports.AssignStylistSchema = void 0;
const zod_1 = require("zod");
exports.AssignStylistSchema = zod_1.z
    .object({
    stylistId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid stylist ID'),
})
    .strict();
exports.UnassignStylistSchema = zod_1.z
    .object({
    stylistId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid stylist ID'),
})
    .strict();
exports.ChangeBranchSchema = zod_1.z
    .object({
    stylistId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid stylist ID'),
})
    .strict();
