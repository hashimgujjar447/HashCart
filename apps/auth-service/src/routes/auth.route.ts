import { Router } from 'express';
import {
  userRegistration,
  verifyUserAccount,
  loginUser,
  userForgetPassword,
  verifyForgetPasswordOtp,
  resetUserPassword,
  refreshToken,
  getUser,
  registerSeller,
  verifySellerAccount,
  createShop,
} from '../controller/auth.controller';
import { isAuthenticated } from '../../../../packages/middleware/isAuthenticated.middleware';

const router = Router();

router.post('/register', userRegistration);
router.post('/verify', verifyUserAccount);
router.post('/login', loginUser);
router.post('/forgot-password', userForgetPassword);
router.post('/verify-forgot-password-otp', verifyForgetPasswordOtp);
router.post('/reset-password', resetUserPassword);
router.post('/refresh-token-user', refreshToken);

router.get('/logged-in-user', isAuthenticated, getUser);

// seller routes

router.post('/register-seller', registerSeller);
router.post('/verify-seller', verifySellerAccount);
router.post('/create-shop', isAuthenticated, createShop);

export default router;
