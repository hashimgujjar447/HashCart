import { Router } from 'express';
import {
  createPaymentSession,
  createPaymentIntent,
  createOrder,
  verifyPaymentAndCreateOrder,
  createDirectOrder,
  getUserOrders,
  getOrderById,
  getSellerOrders,
  getSellerDashboardAnalytics,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/order.controller';
import { isAuthenticated } from '../../../../packages/middleware/isAuthenticated.middleware';
import { isSeller } from '../../../../packages/middleware/authorizeRoles';

const router = Router();

router.post('/create-direct-order', isAuthenticated, createDirectOrder);
router.post('/create-payment-session', isAuthenticated, createPaymentSession);
router.post('/create-payment-intent', isAuthenticated, createPaymentIntent);
router.post('/verify-payment', isAuthenticated, verifyPaymentAndCreateOrder);
router.post('/webhook', createOrder);

router.get('/get-user-orders', isAuthenticated, getUserOrders);
router.get('/get-order/:id', isAuthenticated, getOrderById);
router.put('/cancel-order/:id', isAuthenticated, cancelOrder);

router.get('/get-seller-orders', isAuthenticated, isSeller, getSellerOrders);
router.get(
  '/get-seller-analytics',
  isAuthenticated,
  isSeller,
  getSellerDashboardAnalytics,
);
router.put(
  '/update-order-status/:id',
  isAuthenticated,
  isSeller,
  updateOrderStatus,
);

export default router;
