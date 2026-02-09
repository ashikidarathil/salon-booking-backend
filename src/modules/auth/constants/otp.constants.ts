export const OTP_TTL = {
  SIGNUP_EMAIL: 300,
  SIGNUP_SMS: 300,
  RESET_PASSWORD: 600,
};

export const otpKey = {
  signupEmail: (email: string) => `otp:signup:email:${email}`,
  signupSms: (phone: string) => `otp:signup:sms:${phone}`,
  resetPassword: (email: string) => `otp:reset:email:${email}`,
};
