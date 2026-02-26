export const HOLIDAY_MESSAGES = {
  FETCHED: 'Holidays fetched successfully',
  CREATED: 'Holiday created successfully',
  DELETED: 'Holiday deleted successfully',
  NOT_FOUND: 'Holiday not found',
} as const;

export const HOLIDAY_ROUTES = {
  BASE: '/holidays',
  BY_ID: '/:id',
  BY_BRANCH: '/branch/:branchId',
} as const;
