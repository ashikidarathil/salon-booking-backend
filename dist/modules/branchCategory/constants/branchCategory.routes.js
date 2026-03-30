"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BRANCH_CATEGORY_ROUTES = void 0;
exports.BRANCH_CATEGORY_ROUTES = {
    ADMIN: {
        LIST: '/admin/branches/:branchId/categories',
        LIST_PAGINATED: '/admin/branches/:branchId/categories/paginated',
        TOGGLE: '/admin/branches/:branchId/categories/:categoryId',
    },
};
