export const API_ROUTES = {
  ADMIN: {
    SERVICE: {
      BASE: '/admin/services',
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
    },
  },
} as const;
