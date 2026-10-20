import { isArray } from 'util';
import { ValidationError } from '../../../../packages/error-handler';
import prisma from '../../../../packages/libs/prisma';

import { NextFunction, Request, Response } from 'express';

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const config = await prisma.site_config.findFirst();

    if (!config) {
      return res.status(404).json({ message: 'Categories not found' });
    }

    return res.status(200).json({
      categories: config.categories,
      subCategories: config.subCategories,
    });
  } catch (error) {
    return next(error);
  }
};

export const createDiscountCodes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { public_name, discountType, discountValue, discountCode } = req.body;

    if (!public_name || !discountType || !discountValue || !discountCode) {
      return next(new ValidationError('All fields are required'));
    }

    const isDiscountCode = await prisma.discount_codes.findUnique({
      where: { discountCode },
    });

    if (isDiscountCode) {
      return next(
        new ValidationError(
          'Discount code already available please use a different code.',
        ),
      );
    }

    const discount_code = await prisma.discount_codes.create({
      data: {
        public_name,
        discountCode,
        discountType,
        discountValue: parseFloat(discountValue),
        sellerId: req.seller?.id || '',
      },
    });

    return res.status(200).json({
      success: true,
      discount_code,
    });
  } catch (error) {
    next(error);
  }
};

export const getDiscountCodes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const discount_codes = await prisma.discount_codes.findMany({
      where: {
        sellerId: req.seller?.id || '',
      },
    });

    res.status(200).json({
      success: true,
      discount_codes,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDiscountCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller?.id || '';

    if (!id || isArray(id)) {
      return next(new ValidationError('Discount code ID is required'));
    }

    const findDiscountCode = await prisma.discount_codes.findFirst({
      where: {
        id: id,
      },
      select: {
        id: true,
        sellerId: true,
      },
    });

    if (!findDiscountCode) {
      return next(new ValidationError('Discount code not found'));
    }

    if (findDiscountCode.sellerId !== sellerId) {
      return next(
        new ValidationError(
          'You are not authorized to delete this discount code',
        ),
      );
    }

    await prisma.discount_codes['delete']({
      where: {
        id: id,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Discount code deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
