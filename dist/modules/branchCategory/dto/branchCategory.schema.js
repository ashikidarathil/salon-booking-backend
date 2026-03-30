"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchCategoryPaginationSchema = exports.ToggleBranchCategorySchema = void 0;
const zod_1 = require("zod");
exports.ToggleBranchCategorySchema = zod_1.z
    .object({
    isActive: zod_1.z.boolean(),
})
    .strict();
exports.BranchCategoryPaginationSchema = zod_1.z.object({
    page: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 10)),
    search: zod_1.z.string().optional(),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE']).optional(),
});
