"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscrowPaginationSchema = void 0;
const zod_1 = require("zod");
exports.EscrowPaginationSchema = zod_1.z.object({
    page: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 10)),
    search: zod_1.z.string().optional(),
    stylistId: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    releaseDate: zod_1.z.string().optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
});
