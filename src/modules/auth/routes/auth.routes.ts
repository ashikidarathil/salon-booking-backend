import { Router } from 'express';
import { resolveAuthController } from '../index';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { uploadMiddleware } from '../../../common/middleware/upload.middleware';

const router = Router();
const controller = resolveAuthController();

router.post('/signup', controller.signup.bind(controller));
router.post('/login', controller.login.bind(controller));
router.post('/google', controller.googleLogin.bind(controller));
router.post('/verify-otp', controller.verifyOtp.bind(controller));
router.post('/forgot-password', controller.forgotPassword.bind(controller));
router.post('/reset-password', controller.resetPassword.bind(controller));
router.post('/refresh', controller.refresh.bind(controller));
router.post('/logout', controller.logout.bind(controller));
router.get('/me', authMiddleware, controller.me.bind(controller));
router.post('/sms/send-otp', authMiddleware, controller.sendSmsOtp.bind(controller));
// router.post('/sms/verify-otp', authMiddleware, controller.verifySmsOtp.bind(controller));
router.post('/sms/verify-signup-otp', controller.verifySignupSmsOtp.bind(controller));
router.post('/resend-email-otp', controller.resendEmailOtp.bind(controller));
router.post('/resend-sms-otp', controller.resendSmsOtp.bind(controller));

router.post('/resend-reset-otp', controller.resendResetOtp.bind(controller));
router.post('/verify-reset-otp', controller.verifyResetOtp.bind(controller));

router.post(
  '/profile/upload-picture',
  authMiddleware,
  uploadMiddleware.single('profilePicture'),
  controller.uploadProfilePicture.bind(controller),
);

router.put(
  '/profile/update-picture',
  authMiddleware,
  uploadMiddleware.single('profilePicture'),
  controller.updateProfilePicture.bind(controller),
);

export default router;
