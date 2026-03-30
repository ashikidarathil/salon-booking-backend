"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_ROUTES = void 0;
exports.API_ROUTES = {
    ADMIN: {
        BASE: '/',
        UPDATE: '/:id',
        TOGGLE_STATUS: '/:id/toggle',
        DELETE: '/:id',
    },
    USER: {
        VALIDATE: '/validate',
        AVAILABLE: '/available',
    },
};
