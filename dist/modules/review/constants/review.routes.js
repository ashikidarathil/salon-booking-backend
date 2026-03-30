"use strict";
/**
 * Review Module - Route Constants
 * Centralized route paths for maintainability
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.REVIEW_ROUTES = void 0;
exports.REVIEW_ROUTES = {
    // Public routes
    TOP_STYLISTS: '/top-stylists',
    TOP_SERVICES: '/top-services',
    STYLIST_RATING: '/stylist/:stylistId/rating',
    BASE: '/',
    // Admin routes
    BY_ID: '/:id',
    RESTORE: '/:id/restore',
};
