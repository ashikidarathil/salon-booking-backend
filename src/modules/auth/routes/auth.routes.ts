import { Router } from 'express';
import { resolveAuthController } from '../index';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { uploadMiddleware } from '../../../common/middleware/upload.middleware';
import { AUTH_ROUTES } from '../constants/auth.routes';
import { validate } from '../../../common/middleware/validation.middleware';
import {
  LoginSchema,
  SignupSchema,
  VerifyOtpSchema,
  GoogleLoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  UpdateProfileSchema,
  ChangePasswordSchema,
  ResendEmailOtpSchema,
  ResendSmsOtpSchema,
  SendSmsOtpSchema,
  VerifySignupSmsOtpSchema,
  VerifyResetOtpSchema,
  ResendResetOtpSchema,
} from '../dto/auth.schema';

const router = Router();
const controller = resolveAuthController();

router.post(
  AUTH_ROUTES.SIGNUP,
  validate({ body: SignupSchema }),
  controller.signup.bind(controller),
);
router.post(AUTH_ROUTES.LOGIN, validate({ body: LoginSchema }), controller.login.bind(controller));
router.post(
  AUTH_ROUTES.GOOGLE_LOGIN,
  validate({ body: GoogleLoginSchema }),
  controller.googleLogin.bind(controller),
);
router.post(
  AUTH_ROUTES.VERIFY_OTP,
  validate({ body: VerifyOtpSchema }),
  controller.verifyOtp.bind(controller),
);
router.post(
  AUTH_ROUTES.FORGOT_PASSWORD,
  validate({ body: ForgotPasswordSchema }),
  controller.forgotPassword.bind(controller),
);
router.post(
  AUTH_ROUTES.RESET_PASSWORD,
  validate({ body: ResetPasswordSchema }),
  controller.resetPassword.bind(controller),
);
router.post(AUTH_ROUTES.REFRESH_TOKEN, controller.refresh.bind(controller));
router.post(AUTH_ROUTES.LOGOUT, controller.logout.bind(controller));
router.post(
  AUTH_ROUTES.VERIFY_SIGNUP_SMS_OTP,
  validate({ body: VerifySignupSmsOtpSchema }),
  controller.verifySignupSmsOtp.bind(controller),
);
router.post(
  AUTH_ROUTES.RESEND_EMAIL_OTP,
  validate({ body: ResendEmailOtpSchema }),
  controller.resendEmailOtp.bind(controller),
);
router.post(
  AUTH_ROUTES.RESEND_SMS_OTP,
  validate({ body: ResendSmsOtpSchema }),
  controller.resendSmsOtp.bind(controller),
);
router.post(
  AUTH_ROUTES.RESEND_RESET_OTP,
  validate({ body: ResendResetOtpSchema }),
  controller.resendResetOtp.bind(controller),
);
router.post(
  AUTH_ROUTES.VERIFY_RESET_OTP,
  validate({ body: VerifyResetOtpSchema }),
  controller.verifyResetOtp.bind(controller),
);

router.use(authMiddleware);

router.get(AUTH_ROUTES.GET_ME, controller.me.bind(controller));
router.post(
  AUTH_ROUTES.SEND_SMS_OTP,
  validate({ body: SendSmsOtpSchema }),
  controller.sendSmsOtp.bind(controller),
);

router.post(
  AUTH_ROUTES.UPLOAD_PROFILE_PICTURE,
  uploadMiddleware.single('profilePicture'),
  controller.uploadProfilePicture.bind(controller),
);

router.put(
  AUTH_ROUTES.UPDATE_PROFILE_PICTURE,
  uploadMiddleware.single('profilePicture'),
  controller.updateProfilePicture.bind(controller),
);

router.post(
  AUTH_ROUTES.CHANGE_PASSWORD,
  validate({ body: ChangePasswordSchema }),
  controller.changePassword.bind(controller),
);

router.put(
  AUTH_ROUTES.UPDATE_PROFILE,
  validate({ body: UpdateProfileSchema }),
  controller.updateProfile.bind(controller),
);

export default router;
