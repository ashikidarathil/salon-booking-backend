"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STYLIST_SERVICE_ROUTES = void 0;
exports.STYLIST_SERVICE_ROUTES = {
    BASE: '',
    ADMIN: {
        LIST: '/admin/stylists/:stylistId/services',
        LIST_PAGINATED: '/admin/stylists/:stylistId/services/paginated',
        TOGGLE_STATUS: '/admin/stylists/:stylistId/services/:serviceId/status',
    },
    USER: {
        STYLISTS_BY_SERVICE: '/public/services/:serviceId/stylists',
        LIST_BY_STYLIST: '/stylists/:stylistId/services',
    },
};
