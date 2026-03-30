"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpKey = exports.OTP_TTL = void 0;
exports.OTP_TTL = {
    SIGNUP_EMAIL: 300,
    SIGNUP_SMS: 300,
    RESET_PASSWORD: 600,
};
exports.otpKey = {
    signupEmail: (email) => `otp:signup:email:${email}`,
    signupSms: (phone) => `otp:signup:sms:${phone}`,
    resetPassword: (email) => `otp:reset:email:${email}`,
};
