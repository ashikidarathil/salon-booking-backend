export const MESSAGES = {
  AUTH: {
    EMAIL_EXISTS: 'Email already registered',
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_NOT_FOUND: 'User not found',
    SIGNUP_OK_VERIFY_OTP: 'Signup successful. Please verify OTP.',
    OTP_OK: 'Account verified successfully',
    OTP_INVALID: 'Invalid or expired OTP',
    RESET_OTP_INVALID: 'Invalid or expired reset OTP',
    RESET_TOKEN_SENT: 'Password reset token sent',
    RESET_OK: 'Password reset successful',
    NO_TOKEN: 'No token provided',
    INVALID_TOKEN: 'Invalid token',
    UNAUTHORIZED: 'Unauthorized',
    FORBIDDEN: 'Forbidden',
  },
} as const;
