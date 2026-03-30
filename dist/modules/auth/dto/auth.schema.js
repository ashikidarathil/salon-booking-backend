"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplyAsStylistSchema = exports.ResendResetOtpSchema = exports.VerifyResetOtpSchema = exports.VerifySignupSmsOtpSchema = exports.SendSmsOtpSchema = exports.ResendSmsOtpSchema = exports.ResendEmailOtpSchema = exports.ChangePasswordSchema = exports.UpdateProfileSchema = exports.ResetPasswordSchema = exports.ForgotPasswordSchema = exports.GoogleLoginSchema = exports.VerifyOtpSchema = exports.SignupSchema = exports.LoginSchema = void 0;
const zod_1 = require("zod");
exports.LoginSchema = zod_1.z
    .object({
    identifier: zod_1.z.string().min(1, 'Identifier (Email or Phone) is required'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
    role: zod_1.z.enum(['USER', 'ADMIN', 'STYLIST']).optional(),
})
    .strict();
exports.SignupSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters long'),
    email: zod_1.z.string().email('Invalid email address').optional(),
    phone: zod_1.z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
        .optional(),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
})
    .strict()
    .refine((data) => data.email || data.phone, {
    message: 'Either email or phone is required',
    path: ['email', 'phone'],
});
exports.VerifyOtpSchema = zod_1.z
    .object({
    email: zod_1.z.string().email('Invalid email address'),
    otp: zod_1.z.string().length(6, 'OTP must be 6 digits'),
})
    .strict();
exports.GoogleLoginSchema = zod_1.z
    .object({
    idToken: zod_1.z.string().min(1, 'ID Token is required'),
})
    .strict();
exports.ForgotPasswordSchema = zod_1.z
    .object({
    email: zod_1.z.string().email('Invalid email address'),
})
    .strict();
exports.ResetPasswordSchema = zod_1.z
    .object({
    email: zod_1.z.string().email('Invalid email address'),
    otp: zod_1.z.string().length(6, 'OTP must be 6 digits'),
    newPassword: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
})
    .strict();
exports.UpdateProfileSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters long').optional(),
    email: zod_1.z.string().email('Invalid email address').optional(),
    phone: zod_1.z
        .string()
        .regex(/^\+?[1-9]\d{1,23}$/, 'Invalid phone number')
        .optional(),
    bio: zod_1.z.string().max(500, 'Bio must be at most 500 characters long').optional(),
})
    .strict();
exports.ChangePasswordSchema = zod_1.z
    .object({
    currentPassword: zod_1.z.string().min(6, 'Current password must be at least 6 characters'),
    newPassword: zod_1.z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: zod_1.z.string().min(6, 'Confirm password must be at least 6 characters'),
})
    .strict();
exports.ResendEmailOtpSchema = zod_1.z
    .object({
    email: zod_1.z.string().email('Invalid email address'),
})
    .strict();
exports.ResendSmsOtpSchema = zod_1.z
    .object({
    phone: zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
})
    .strict();
exports.SendSmsOtpSchema = zod_1.z
    .object({
    phone: zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
})
    .strict();
exports.VerifySignupSmsOtpSchema = zod_1.z
    .object({
    phone: zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
    otp: zod_1.z.string().length(6, 'OTP must be 6 digits'),
})
    .strict();
exports.VerifyResetOtpSchema = zod_1.z
    .object({
    email: zod_1.z.string().email('Invalid email address'),
    otp: zod_1.z.string().length(6, 'OTP must be 6 digits'),
})
    .strict();
exports.ResendResetOtpSchema = zod_1.z
    .object({
    email: zod_1.z.string().email('Invalid email address'),
})
    .strict();
exports.ApplyAsStylistSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(2, 'Name is required'),
    email: zod_1.z.string().email('Invalid email').optional(),
    phone: zod_1.z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone')
        .optional(),
    specialization: zod_1.z.string().min(1, 'Specialization is required'),
    experience: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().min(0)),
})
    .strict();
