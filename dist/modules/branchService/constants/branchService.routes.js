"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BRANCH_SERVICE_ROUTES = void 0;
exports.BRANCH_SERVICE_ROUTES = {
    ADMIN: {
        LIST: '/admin/branches/:branchId/services',
        LIST_PAGINATED: '/admin/branches/:branchId/services/paginated',
        UPSERT: '/admin/branches/:branchId/services/:serviceId',
        TOGGLE_STATUS: '/admin/branches/:branchId/services/:serviceId/status',
    },
    PUBLIC: {
        LIST_PAGINATED: '/branches/:branchId/services/paginated',
        BY_ID: '/branches/:branchId/services/:serviceId',
    },
};
