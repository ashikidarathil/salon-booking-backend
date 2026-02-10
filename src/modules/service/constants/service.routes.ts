export const API_ROUTES = {
  ADMIN: {
    SERVICE: {
      BASE: '/admin/services',
      PAGINATED: '/admin/services/paginated',
      BY_ID: (id: string) => `/admin/services/${id}`,
      SOFT_DELETE: (id: string) => `/admin/services/${id}/delete`,
      RESTORE: (id: string) => `/admin/services/${id}/restore`,
      UPLOAD_IMAGE: (id: string) => `/admin/services/${id}/upload-image`,
      DELETE_IMAGE: (id: string) => `/admin/services/${id}/delete-image`,
    },
  },

  PUBLIC: {
    SERVICE: {
      LIST: '/services',
      BY_ID: (id: string) => `/services/${id}`,
      PAGINATED: '/services/paginated',
    },
  },
} as const;
