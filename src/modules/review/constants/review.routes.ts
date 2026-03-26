/**
 * Review Module - Route Constants
 * Centralized route paths for maintainability
 */

export const REVIEW_ROUTES = {
  // Public routes
  TOP_STYLISTS: '/top-stylists',
  TOP_SERVICES: '/top-services',
  STYLIST_RATING: '/stylist/:stylistId/rating',
  BASE: '/',

  // Admin routes
  BY_ID: '/:id',
  RESTORE: '/:id/restore',
} as const;

/**
 * Route configuration types for better type safety
 */
export type ReviewRoute = keyof typeof REVIEW_ROUTES;
export type ReviewRoutePath = (typeof REVIEW_ROUTES)[ReviewRoute];
