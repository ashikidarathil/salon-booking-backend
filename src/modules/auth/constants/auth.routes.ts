/**
 * Auth Module - Route Constants
 * Centralized route paths for maintainability
 */

export const AUTH_ROUTES = {
  // Public routes
  SIGNUP: '/signup',
  LOGIN: '/login',
  GOOGLE_LOGIN: '/google',
  VERIFY_OTP: '/verify-otp',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  REFRESH_TOKEN: '/refresh',
  LOGOUT: '/logout',
  VERIFY_SIGNUP_SMS_OTP: '/sms/verify-signup-otp',
  RESEND_EMAIL_OTP: '/resend-email-otp',
  RESEND_SMS_OTP: '/resend-sms-otp',
  RESEND_RESET_OTP: '/resend-reset-otp',
  VERIFY_RESET_OTP: '/verify-reset-otp',

  // Protected routes (require authentication)
  GET_ME: '/me',
  SEND_SMS_OTP: '/sms/send-otp',
  VERIFY_SMS_OTP: '/sms/verify-otp',
  UPLOAD_PROFILE_PICTURE: '/profile/upload-picture',
  UPDATE_PROFILE_PICTURE: '/profile/update-picture',
} as const;

/**
 * Route configuration types for better type safety
 */
export type AuthRoute = keyof typeof AUTH_ROUTES;
export type AuthRoutePath = (typeof AUTH_ROUTES)[AuthRoute];
