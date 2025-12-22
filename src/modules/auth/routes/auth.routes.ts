import { Router } from 'express';
import { resolveAuthController } from '../index';

const router = Router();
const controller = resolveAuthController();

router.post('/signup', controller.signup.bind(controller));
router.post('/login', controller.login.bind(controller));
router.post('/verify-otp', controller.verifyOtp.bind(controller));
router.post('/forgot-password', controller.forgotPassword.bind(controller));
router.post('/reset-password', controller.resetPassword.bind(controller));

export default router;
