import { Router } from 'express';
import {
  userRegistration,
  verifyUserAccount,
  loginUser,
  userForgetPassword,
  verifyForgetPasswordOtp,
  resetUserPassword,
} from '../controller/auth.controller';

const router = Router();

router.post('/register', userRegistration);
router.post('/verify', verifyUserAccount);
router.post('/login', loginUser);
router.post('/forget-password', userForgetPassword);
router.post('/verify-forget-password-otp', verifyForgetPasswordOtp);
router.post('/reset-password', resetUserPassword);

export default router;

