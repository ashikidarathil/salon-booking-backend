export const MESSAGES = {
  AUTH: {
    // Signup / OTP
    AUTH_REQUIRED: 'Authentication required',
    EMAIL_REQUIRED: 'Email required',
    EMAIL_AND_OTP_REQUIRED: 'Email and OTP required',
    SIGNUP_EMAIL_SUCCESS: 'Signup successful. Please verify email OTP.',
    SIGNUP_PHONE_SUCCESS: 'Signup successful. Please verify phone OTP.',
    OTP_SENT_TO_MOBILE: 'OTP sent to mobile',

    OTP_VERIFIED: 'Account verified successfully',
    OTP_INVALID: 'Invalid or expired OTP',
    RESET_OTP_INVALID: 'Invalid or expired reset OTP',

    EMAIL_EXISTS: 'Email already registered',
    PHONE_EXISTS: 'Phone already registered',
    EMAIL_OR_PHONE_REQUIRED: 'Email or phone is required',

    EMAIL_NOT_FOUND: 'Email not found',
    PHONE_NOT_FOUND: 'Phone not found',
    USER_NOT_FOUND: 'User not found',

    // Login
    LOGIN_SUCCESS: 'Login successful',
    INVALID_CREDENTIALS: 'Invalid email/phone or password',
    USER_BLOCKED: 'Your account has been blocked',
    VERIFY_EMAIL_OR_PHONE: 'Please verify email or phone before login',

    // Role / Provider
    UNAUTHORIZED_ROLE_ACCESS: 'Unauthorized role access',
    USE_GOOGLE_LOGIN: 'This account uses Google login',
    GOOGLE_LOGIN_ONLY_FOR_USERS: 'Google login allowed only for users',
    INVALID_GOOGLE_TOKEN: 'Invalid Google authentication token',

    // Password
    RESET_TOKEN_SENT: 'Password reset OTP sent',
    RESET_OK: 'Password reset successful',

    // Tokens
    NO_TOKEN: 'No token provided',
    INVALID_TOKEN: 'Invalid token',

    // Application
    STYLIST_APPLICATION_SUCCESS:
      'Application submitted successfully. Admin will review and send invitation.',
    SPECIALIZATION_REQUIRED: 'Specialization is required',
    EXPERIENCE_REQUIRED: 'Experience is required',

    // Pofile
    NO_FILE_UPLOADED: 'No file uploaded',
  },

  COMMON: {
    UNAUTHORIZED: 'Unauthorized',
    FORBIDDEN: 'Forbidden',
    BAD_REQUEST: 'Invalid request',
    INTERNAL_ERROR: 'Something went wrong',
    HANDLED_APP_ERROR: 'Handled AppError',
    UNKNOWN_ERROR: 'Unknown error',
    UNHANDLED_ERROR: 'Unhandled Error',
    YOUR_ACC_IS_BLOCKED: 'Your account is blocked. You have been logged out.',
  },
} as const;
