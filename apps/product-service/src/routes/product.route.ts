import Router from 'express';
import {
  createDiscountCodes,
  deleteDiscountCode,
  getCategories,
  getDiscountCodes,
  uploadProductImage,
  deleteProductImage,
} from '../controller/product.controller';
import { isAuthenticated } from '../../../../packages/middleware/isAuthenticated.middleware';
import { isSeller } from '../../../../packages/middleware/authorizeRoles';

const router = Router();

router.get('/get-categories', getCategories);

router.post(
  '/create-discount-code',
  isAuthenticated,
  isSeller,
  createDiscountCodes,
);
router.post(
  '/create-discount-codes',
  isAuthenticated,
  isSeller,
  createDiscountCodes,
);
router.get('/get-discount-codes', isAuthenticated, isSeller, getDiscountCodes);
router.delete(
  '/delete-discount-code/:id',
  isAuthenticated,
  isSeller,
  deleteDiscountCode,
);
router.post(
  '/upload-product-image',
  isAuthenticated,
  isSeller,
  uploadProductImage,
);

router.delete(
  '/delete-product-image',
  isAuthenticated,
  isSeller,
  deleteProductImage,
);

export default router;
