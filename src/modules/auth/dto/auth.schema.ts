import { z } from 'zod';

export const LoginSchema = z
  .object({
    identifier: z.string().min(1, 'Identifier (Email or Phone) is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    role: z.enum(['USER', 'ADMIN', 'STYLIST']).optional(),
  })
  .strict();
export type LoginDto = z.infer<typeof LoginSchema>;

export const SignupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    email: z.string().email('Invalid email address').optional(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
      .optional(),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  })
  .strict()
  .refine((data) => data.email || data.phone, {
    message: 'Either email or phone is required',
    path: ['email', 'phone'],
  });
export type SignupDto = z.infer<typeof SignupSchema>;

export const VerifyOtpSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
  })
  .strict();
export type VerifyOtpDto = z.infer<typeof VerifyOtpSchema>;

export const GoogleLoginSchema = z
  .object({
    idToken: z.string().min(1, 'ID Token is required'),
  })
  .strict();
export type GoogleLoginDto = z.infer<typeof GoogleLoginSchema>;

export const ForgotPasswordSchema = z
  .object({
    email: z.string().email('Invalid email address'),
  })
  .strict();
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
  })
  .strict();
export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;

export const UpdateProfileSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,23}$/, 'Invalid phone number')
      .optional(),
    bio: z.string().max(500, 'Bio must be at most 500 characters long').optional(),
  })
  .strict();
export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Current password must be at least 6 characters'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
  })
  .strict();
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;

export const ResendEmailOtpSchema = z
  .object({
    email: z.string().email('Invalid email address'),
  })
  .strict();
export type ResendEmailOtpDto = z.infer<typeof ResendEmailOtpSchema>;

export const ResendSmsOtpSchema = z
  .object({
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  })
  .strict();
export type ResendSmsOtpDto = z.infer<typeof ResendSmsOtpSchema>;

export const SendSmsOtpSchema = z
  .object({
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  })
  .strict();
export type SendSmsOtpDto = z.infer<typeof SendSmsOtpSchema>;

export const VerifySignupSmsOtpSchema = z
  .object({
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
  })
  .strict();
export type VerifySignupSmsOtpDto = z.infer<typeof VerifySignupSmsOtpSchema>;

export const VerifyResetOtpSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
  })
  .strict();
export type VerifyResetOtpDto = z.infer<typeof VerifyResetOtpSchema>;

export const ResendResetOtpSchema = z
  .object({
    email: z.string().email('Invalid email address'),
  })
  .strict();
export type ResendResetOtpDto = z.infer<typeof ResendResetOtpSchema>;

export const ApplyAsStylistSchema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email').optional(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone')
      .optional(),
    specialization: z.string().min(1, 'Specialization is required'),
    experience: z.preprocess((val) => Number(val), z.number().min(0)),
  })
  .strict();
export type ApplyAsStylistDto = z.infer<typeof ApplyAsStylistSchema>;
