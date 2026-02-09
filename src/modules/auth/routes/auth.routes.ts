import { Router } from 'express';
import { resolveAuthController } from '../index';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { uploadMiddleware } from '../../../common/middleware/upload.middleware';
import { AUTH_ROUTES } from '../constants/auth.routes';

const router = Router();
const controller = resolveAuthController();

router.post(AUTH_ROUTES.SIGNUP, controller.signup.bind(controller));
router.post(AUTH_ROUTES.LOGIN, controller.login.bind(controller));
router.post(AUTH_ROUTES.GOOGLE_LOGIN, controller.googleLogin.bind(controller));
router.post(AUTH_ROUTES.VERIFY_OTP, controller.verifyOtp.bind(controller));
router.post(AUTH_ROUTES.FORGOT_PASSWORD, controller.forgotPassword.bind(controller));
router.post(AUTH_ROUTES.RESET_PASSWORD, controller.resetPassword.bind(controller));
router.post(AUTH_ROUTES.REFRESH_TOKEN, controller.refresh.bind(controller));
router.post(AUTH_ROUTES.LOGOUT, controller.logout.bind(controller));
router.post(AUTH_ROUTES.VERIFY_SIGNUP_SMS_OTP, controller.verifySignupSmsOtp.bind(controller));
router.post(AUTH_ROUTES.RESEND_EMAIL_OTP, controller.resendEmailOtp.bind(controller));
router.post(AUTH_ROUTES.RESEND_SMS_OTP, controller.resendSmsOtp.bind(controller));
router.post(AUTH_ROUTES.RESEND_RESET_OTP, controller.resendResetOtp.bind(controller));
router.post(AUTH_ROUTES.VERIFY_RESET_OTP, controller.verifyResetOtp.bind(controller));

router.get(AUTH_ROUTES.GET_ME, authMiddleware, controller.me.bind(controller));
router.post(AUTH_ROUTES.SEND_SMS_OTP, authMiddleware, controller.sendSmsOtp.bind(controller));
// router.post(AUTH_ROUTES.VERIFY_SMS_OTP, authMiddleware, controller.verifySmsOtp.bind(controller));

router.post(
  AUTH_ROUTES.UPLOAD_PROFILE_PICTURE,
  authMiddleware,
  uploadMiddleware.single('profilePicture'),
  controller.uploadProfilePicture.bind(controller),
);

router.put(
  AUTH_ROUTES.UPDATE_PROFILE_PICTURE,
  authMiddleware,
  uploadMiddleware.single('profilePicture'),
  controller.updateProfilePicture.bind(controller),
);

router.post(
  AUTH_ROUTES.CHANGE_PASSWORD,
  authMiddleware,
  controller.changePassword.bind(controller),
);

router.put(AUTH_ROUTES.UPDATE_PROFILE, authMiddleware, controller.updateProfile.bind(controller));

export default router;
