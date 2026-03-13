export const COUPON_MESSAGES = {
  ALREADY_EXISTS: 'Coupon code already exists',
  NOT_FOUND: 'Coupon not found',
  INACTIVE: 'Coupon is inactive',
  EXPIRED: 'Coupon has expired',
  LIMIT_REACHED: 'Coupon usage limit reached',
  MIN_AMOUNT_NOT_MET: (minAmount: number) =>
    `Minimum booking amount for this coupon is ${minAmount}`,
  CREATE_SUCCESS: 'Coupon created successfully',
  VALIDATE_SUCCESS: 'Coupon is valid',
  FETCH_SUCCESS: 'Coupons retrieved successfully',
  TOGGLE_SUCCESS: 'Coupon status toggled successfully',
  DELETE_SUCCESS: 'Coupon deleted successfully',
  UPDATE_FAILED: 'Failed to update coupon',
  INVALID_INPUT: 'Invalid input data',
};
