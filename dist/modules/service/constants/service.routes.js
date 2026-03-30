"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_ROUTES = void 0;
exports.API_ROUTES = {
    ADMIN: {
        SERVICE: {
            BASE: '/admin/services',
            PAGINATED: '/admin/services/paginated',
            BY_ID: (id) => `/admin/services/${id}`,
            SOFT_DELETE: (id) => `/admin/services/${id}/delete`,
            RESTORE: (id) => `/admin/services/${id}/restore`,
            UPLOAD_IMAGE: (id) => `/admin/services/${id}/upload-image`,
            DELETE_IMAGE: (id) => `/admin/services/${id}/delete-image`,
        },
    },
    PUBLIC: {
        SERVICE: {
            LIST: '/services',
            BY_ID: (id) => `/services/${id}`,
            PAGINATED: '/services/paginated',
        },
    },
};
