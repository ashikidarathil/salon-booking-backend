export const SCHEDULE_MESSAGES = {
  WEEKLY_FETCHED: 'Weekly schedule fetched successfully',
  WEEKLY_UPDATED: 'Weekly schedule updated successfully',
  OVERRIDE_CREATED: 'Daily override created successfully',
  OVERRIDE_DELETED: 'Daily override deleted successfully',
  OVERRIDE_FETCHED: 'Daily override fetched successfully',
  NOT_FOUND: 'Schedule not found',
  INVALID_TIME_RANGE: 'Invalid time range provided',
  UNAUTHORIZED: 'Unauthorized to manage this schedule',
  BREAK_ADDED: 'Break added successfully',
  BREAK_DELETED: 'Break deleted successfully',
  BREAK_FETCHED: 'Breaks fetched successfully',
  BREAK_LIMIT_EXCEEDED: (mins: number) =>
    `Total break time cannot exceed 90 minutes per day. Currently ${mins} mins.`,
} as const;

export const SCHEDULE_ROUTES = {
  BASE: '/schedules',
  WEEKLY: '/weekly',
  WEEKLY_DETAIL: '/weekly/:dayOfWeek',
  DAILY: '/daily',
  BY_ID: '/:id',
  BY_STYLIST: '/stylists/:stylistId',
  BREAKS: '/breaks',
  BREAKS_BY_ID: '/breaks/:id',
};
