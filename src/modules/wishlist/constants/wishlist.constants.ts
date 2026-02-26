export const WISHLIST_MESSAGES = {
  RETRIEVED: 'Favorites retrieved successfully',
  ADDED: 'Added to favorites successfully',
  REMOVED: 'Removed from favorites successfully',
  NOT_FOUND: 'Wishlist item not found',
  STYLIST_REQUIRED: 'Stylist ID is required',
  UNAUTHORIZED: 'Unauthorized',
} as const;

export const WISHLIST_ROUTES = {
  BASE: '/wishlist',
  TOGGLE: '/toggle',
  ME: '/me',
} as const;
