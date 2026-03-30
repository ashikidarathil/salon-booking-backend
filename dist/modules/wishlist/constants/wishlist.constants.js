"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WISHLIST_ROUTES = exports.WISHLIST_MESSAGES = void 0;
exports.WISHLIST_MESSAGES = {
    RETRIEVED: 'Favorites retrieved successfully',
    ADDED: 'Added to favorites successfully',
    REMOVED: 'Removed from favorites successfully',
    NOT_FOUND: 'Wishlist item not found',
    STYLIST_REQUIRED: 'Stylist ID is required',
    UNAUTHORIZED: 'Unauthorized',
};
exports.WISHLIST_ROUTES = {
    BASE: '/wishlist',
    TOGGLE: '/toggle',
    ME: '/me',
};
