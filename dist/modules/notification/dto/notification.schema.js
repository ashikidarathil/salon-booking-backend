"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkAsReadSchema = exports.GetNotificationsSchema = void 0;
const zod_1 = require("zod");
exports.GetNotificationsSchema = zod_1.z.object({
    page: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 20)),
});
exports.MarkAsReadSchema = zod_1.z
    .object({
    id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid notification ID'),
})
    .strict();
