"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_ROUTES = void 0;
exports.API_ROUTES = {
    ADMIN: {
        USERS: {
            TOGGLE_BLOCK: (userId) => `/users/${userId}/block`,
            GET_USERS: '/users',
        },
        DASHBOARD: {
            STATS: '/dashboard/stats',
        },
    },
};
