"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHAT_ROUTES = void 0;
exports.CHAT_ROUTES = {
    BASE: '/rooms',
    USER_ROOMS: '/rooms/user',
    STYLIST_ROOMS: '/rooms/stylist',
    ADMIN_ROOMS: '/rooms/admin',
    INITIALIZE: '/rooms/initialize',
    TOTAL_UNREAD: '/rooms/total-unread/count',
    UNREAD: '/rooms/:roomId/unread',
    MESSAGES: '/:roomId/messages',
    READ: '/:roomId/read',
    UPLOAD: '/rooms/upload',
};
