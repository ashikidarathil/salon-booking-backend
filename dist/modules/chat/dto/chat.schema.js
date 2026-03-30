"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkChatAsReadSchema = exports.ChatPaginationSchema = exports.InitializeRoomSchema = void 0;
const zod_1 = require("zod");
exports.InitializeRoomSchema = zod_1.z
    .object({
    bookingId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID'),
})
    .strict();
exports.ChatPaginationSchema = zod_1.z.object({
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 20)),
    skip: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 0)),
});
exports.MarkChatAsReadSchema = zod_1.z
    .object({
    roomId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid room ID'),
})
    .strict();
