"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BRANCH_ROUTES = void 0;
exports.BRANCH_ROUTES = {
    ADMIN: {
        BRANCH: {
            BASE: '/admin/branches',
            PAGINATED_LIST: '/admin/branches/paginated',
            BY_ID: (id) => `/admin/branches/${id}`,
            SOFT_DELETE: (id) => `/admin/branches/${id}/disable`,
            RESTORE: (id) => `/admin/branches/${id}/restore`,
        },
    },
    PUBLIC: {
        BRANCH: {
            LIST: '/branches',
            PAGINATED_LIST: '/branches/paginated',
            BY_ID: (id) => `/branches/${id}`,
            NEAREST: '/branches/nearest',
        },
    },
};
