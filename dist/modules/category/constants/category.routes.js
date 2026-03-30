"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CATEGORY_ROUTES = void 0;
exports.CATEGORY_ROUTES = {
    ADMIN: {
        CATEGORY: {
            BASE: '/admin/categories',
            PAGINATED: '/admin/categories/paginated',
            BY_ID: (id) => `/admin/categories/${id}`,
            SOFT_DELETE: (id) => `/admin/categories/${id}/delete`,
            RESTORE: (id) => `/admin/categories/${id}/restore`,
        },
    },
    PUBLIC: {
        CATEGORY: {
            LIST: '/categories',
        },
    },
};
