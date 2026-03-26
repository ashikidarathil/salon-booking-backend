export const MESSAGES = {
  AUTH: {
    // Signup / OTP
    SIGNUP_SUCCESS: 'Signup successful',
    OTP_VERIFIED: 'OTP verified',
    SMS_OTP_SENT: 'SMS OTP sent',
    PHONE_VERIFIED: 'Phone verified',
    EMAIL_OTP_SENT: 'New OTP sent to email',
    SMS_OTP_RESENT: 'New OTP sent to phone',
    OTP_SENT_TO_MOBILE: 'OTP sent to mobile',
    SIGNUP_EMAIL_SUCCESS: 'Signup successful. Please verify email OTP.',
    SIGNUP_PHONE_SUCCESS: 'Signup successful. Please verify phone OTP.',
    OTP_INVALID: 'Invalid or expired OTP',

    // Login
    LOGIN_SUCCESS: 'Login successful',
    GOOGLE_LOGIN_SUCCESS: 'Google login successful',
    LOGOUT_SUCCESS: 'Logged out successfully',
    INVALID_CREDENTIALS: 'Invalid email/phone or password',
    USER_BLOCKED: 'Your account has been blocked',
    VERIFY_EMAIL_OR_PHONE: 'Please verify email or phone before login',

    // Role / Provider
    UNAUTHORIZED_ROLE_ACCESS: 'Unauthorized role access',
    USE_GOOGLE_LOGIN: 'This account uses Google login',
    GOOGLE_LOGIN_ONLY_FOR_USERS: 'Google login allowed only for users',
    INVALID_GOOGLE_TOKEN: 'Invalid Google authentication token',

    // Password
    RESET_OTP_SENT: 'Reset OTP sent',
    RESET_OTP_RESENT: 'Reset OTP sent to your email',
    RESET_OTP_VERIFIED: 'Reset OTP verified',
    RESET_OK: 'Password reset successful',
    RESET_OTP_INVALID: 'Invalid or expired reset OTP',

    // Tokens
    TOKEN_REFRESHED: 'Token refreshed',
    NO_TOKEN: 'No token provided',
    INVALID_TOKEN: 'Invalid token',
    AUTH_REQUIRED: 'Authentication required',

    // User / Me
    ME_SUCCESS: 'Me',
    USER_NOT_FOUND: 'User not found',
    EMAIL_NOT_FOUND: 'Email not found',
    PHONE_NOT_FOUND: 'Phone not found',
    EMAIL_EXISTS: 'Email already registered',
    PHONE_EXISTS: 'Phone already registered',
    EMAIL_OR_PHONE_REQUIRED: 'Email or phone is required',

    // Application
    STYLIST_APPLICATION_SUBMITTED: 'Stylist application submitted',
    STYLIST_APPLICATION_SUCCESS:
      'Application submitted successfully. Admin will review and send invitation.',
    SPECIALIZATION_REQUIRED: 'Specialization is required',
    EXPERIENCE_REQUIRED: 'Experience is required',

    // Profile
    PROFILE_PICTURE_UPLOAD_SUCCESS: 'Profile picture uploaded successfully',
    PROFILE_PICTURE_UPDATE_SUCCESS: 'Profile picture updated successfully',
    NO_FILE_UPLOADED: 'No file uploaded',
  },

  STYLIST_SCHEDULE: {
    WORKING_DAY_NEEDS_SHIFT: 'Working days must have at least one shift',
    END_DATE_BEFORE_START: 'End date cannot be before start date',
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
