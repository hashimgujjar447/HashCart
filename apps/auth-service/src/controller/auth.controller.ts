import { Request, Response, NextFunction } from 'express';
import {
  checkOtpValidation,
  handleForgetPassword,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyOtp,
  verifyForgetPasswordOtp as verifyForgetPasswordOtpHelper,
} from '../utils/auth.helper';
import Stripe from 'stripe';

import prisma from '../../../../packages/libs/prisma';
import { AuthError, ValidationError } from '../../../../packages/error-handler';
import { redisClient } from '../../../../packages/redis/redis';
import bcrypt from 'bcryptjs';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { setCookie } from '../utils/cookies/setCookie';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Register a new user
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateRegistrationData(req.body, 'user');
    const { name, email } = req.body;
    const isExistingUser = await prisma.users.findUnique({ where: { email } });
    if (isExistingUser) {
      return next(new ValidationError('User already exist with this email!'));
    }

    await checkOtpValidation(email);

    await trackOtpRequests(email);

    await sendOtp(name, email, 'user-activation-mail');

    res.status(200).json({
      message: 'Otp send to email please verify your account',
    });
  } catch (error) {
    return next(error);
  }
};

// Verify user account using OTP

export const verifyUserAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp, password, name } = req.body;
    if (!email || !otp) {
      return next(new ValidationError('Email and OTP are required'));
    }

    const isExistingUser = await prisma.users.findUnique({ where: { email } });

    if (isExistingUser) {
      return next(new ValidationError('User already exist with this email!'));
    }

    if (otp.length !== 4) {
      return next(new ValidationError('OTP must be 4 digits long'));
    }

    await verifyOtp(email, otp);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: 'User account verified and created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Login user
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError('Email and password are required'));
    }

    const user = await prisma.users.findUnique({
      where: { email },
      include: { avatar: true },
    });
    if (!user) {
      return next(new ValidationError('Invalid email or password'));
    }

    const isMatchingPassword = await bcrypt.compare(password, user.password!);
    if (!isMatchingPassword) {
      return next(new ValidationError('Invalid email or password'));
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: 'user' },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: '15m' },
    );

    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email, role: 'user' },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: '7d' },
    );

    // Clear previous cookies first
    res.clearCookie('sellerAccessToken', { path: '/' });
    res.clearCookie('sellerRefreshToken', { path: '/' });
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });

    // Set new user cookies
    setCookie(res, 'accessToken', accessToken);
    setCookie(res, 'refreshToken', refreshToken);
    res.status(200).json({
      message: 'User logged in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        avatar: user.avatar,
        role: 'user',
      },
    });
  } catch (error) {
    return next(error);
  }
};

// forget password request

export const userForgetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await handleForgetPassword(req, res, next, 'user');
};

// verify forget password otp

export const verifyForgetPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await verifyForgetPasswordOtpHelper(req, res, next);
};

// reset password

export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return next(new ValidationError('Email and new password are required'));
    }

    const isVerified = await redisClient.get(
      `password_reset_verified:${email}`,
    );
    if (!isVerified) {
      return next(
        new ValidationError(
          'Please verify the OTP before resetting your password',
        ),
      );
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return next(new ValidationError('User not found'));
    }

    if (user.password) {
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return next(
          new ValidationError('New password cannot be the same as the old one'),
        );
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    await redisClient.del(`password_reset_verified:${email}`);

    res.status(200).json({
      message: 'Password reset successfully',
    });
  } catch (error) {
    return next(error);
  }
};

// refresh token endpoint

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Support both user and seller refresh tokens
    const token = req.cookies.refreshToken || req.cookies.sellerRefreshToken;
    const isSeller =
      !!req.cookies.sellerRefreshToken && !req.cookies.refreshToken;

    if (!token) {
      return next(new ValidationError('Refresh token is required'));
    }

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as {
      userId: string;
      email: string;
      role: string;
    };

    if (!decoded || !decoded.userId || !decoded.email) {
      return next(new JsonWebTokenError('Invalid refresh token'));
    }

    const role = decoded.role || (isSeller ? 'seller' : 'user');

    let userId: string;
    let email: string;

    if (role === 'seller') {
      const seller = await prisma.sellers.findUnique({
        where: { id: decoded.userId },
      });
      if (!seller) {
        return next(new AuthError("Forbidden: Seller doesn't exist"));
      }
      userId = seller.id;
      email = seller.email;
    } else {
      const user = await prisma.users.findUnique({
        where: { id: decoded.userId },
      });
      if (!user) {
        return next(new AuthError("Forbidden: User doesn't exist"));
      }
      userId = user.id;
      email = user.email;
    }

    const accessToken = jwt.sign(
      { userId, email, role },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: '15m' },
    );

    const cookieName = role === 'seller' ? 'sellerAccessToken' : 'accessToken';
    setCookie(res, cookieName, accessToken);

    res.status(200).json({
      message: 'Access token refreshed successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    if (!user || req.role !== 'user') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No active user session',
        user: null,
      });
    }
    return res.status(200).json({
      success: true,
      message: 'User fetched successfully',
      user,
    });
  } catch (error) {
    return next(error);
  }
};

// register seller

export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateRegistrationData(req.body, 'seller');
    const { name, email } = req.body;
    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (existingSeller) {
      throw new ValidationError('Seller already exists with this email');
    }

    await checkOtpValidation(email);
    await trackOtpRequests(email);
    await sendOtp(name, email, 'seller-activation-mail');

    return res.status(200).json({
      message: 'OTP sent to email. Please verify your account.',
    });
  } catch (error) {
    return next(error);
  }
};

// verify seller account
export const verifySellerAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp, password, name, phone_number, country } = req.body;
    if (!email || !otp) {
      return next(new ValidationError('Email and OTP are required'));
    }

    const isExistingUser = await prisma.users.findUnique({ where: { email } });

    if (isExistingUser) {
      return next(new ValidationError('User already exist with this email!'));
    }

    if (otp.length !== 4) {
      return next(new ValidationError('OTP must be 4 digits long'));
    }

    await verifyOtp(email, otp);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.sellers.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone_number: phone_number,
        country: country,
      },
    });

    return res.status(201).json({
      message: 'Seller account verified and created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// create shop for seller
export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      name,
      bio,
      address,
      opening_hours,
      sellerId,
      website,
      category,
      socialLinks,
    } = req.body;

    if (!name || !bio || !address || !opening_hours || !sellerId || !category) {
      return next(new ValidationError('All fields are required'));
    }

    const isCorrectSeller = await prisma.sellers.findUnique({
      where: { id: sellerId },
    });

    if (!isCorrectSeller) {
      return next(new ValidationError('Seller not found'));
    }

    const shopData: any = {
      name,
      bio,
      address,
      opening_hours,
      category,
      sellerId,
    };

    if (website && website.trim() !== '') {
      shopData['website'] = website;
    }

    if (socialLinks && Array.isArray(socialLinks)) {
      shopData['socialLinks'] = socialLinks;
    }

    const shop = await prisma.shops.create({
      data: shopData,
    });
    return res.status(201).json({
      message: 'Shop created successfully',
      shop,
    });
  } catch (error) {
    return next(error);
  }
};

// Create stripe connect account link
export const createStripeConnectAccountLink = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sellerId } = req.body;

    if (!sellerId) {
      return next(new ValidationError('Seller ID is required'));
    }

    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
    });
    if (!seller) {
      return next(new ValidationError('Seller not found'));
    }

    const account = await stripe.v2.core.accounts.create({
      contact_email: seller.email,
      identity: { country: 'GB' },
      dashboard: 'express',
      defaults: {
        responsibilities: {
          fees_collector: 'application',
          losses_collector: 'application',
        },
      },
      configuration: {
        merchant: {
          capabilities: {
            card_payments: { requested: true },
          },
        },
        recipient: {
          capabilities: {
            stripe_balance: {
              stripe_transfers: { requested: true },
            },
          },
        },
      },
    });

    await prisma.sellers.update({
      where: {
        id: sellerId,
      },
      data: {
        stripeId: account.id,
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'http://localhost:3000/success',
      return_url: 'http://localhost:3000/success',
      type: 'account_onboarding',
    });

    return res.status(200).json({
      message: 'Stripe connect account link created successfully',
      accountLink,
    });
  } catch (error) {
    return next(error);
  }
};

// login seller

export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError('Email and password are required'));
    }

    const user = await prisma.sellers.findUnique({ where: { email } });
    if (!user) {
      return next(new ValidationError('Invalid email or password'));
    }

    const isMatchingPassword = await bcrypt.compare(password, user.password!);
    if (!isMatchingPassword) {
      return next(new ValidationError('Invalid email or password'));
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: 'seller' },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: '15m' },
    );

    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email, role: 'seller' },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: '7d' },
    );

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('sellerAccessToken');
    res.clearCookie('sellerRefreshToken');

    setCookie(res, 'sellerAccessToken', accessToken);
    setCookie(res, 'sellerRefreshToken', refreshToken);

    res.status(200).json({
      message: 'Seller logged in successfully',
      seller: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      sellerAccessToken: accessToken,
      sellerRefreshToken: refreshToken,
    });
  } catch (error) {
    return next(error);
  }
};

export const getSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const seller = req.seller;
    if (!seller || req.role !== 'seller') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No active seller session',
        seller: null,
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Seller fetched successfully',
      seller,
    });
  } catch (error) {
    return next(error);
  }
};

// seller forget password request
export const sellerForgetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await handleForgetPassword(req, res, next, 'seller');
};

// reset seller password request function
export const resetSellerPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return next(new ValidationError('Email and new password are required'));
    }

    const isVerified = await redisClient.get(
      `password_reset_verified:${email}`,
    );
    if (!isVerified) {
      return next(
        new ValidationError(
          'Please verify the OTP before resetting your password',
        ),
      );
    }

    const seller = await prisma.sellers.findUnique({ where: { email } });
    if (!seller) {
      return next(new ValidationError('Seller not found'));
    }

    if (seller.password) {
      const isSamePassword = await bcrypt.compare(newPassword, seller.password);
      if (isSamePassword) {
        return next(
          new ValidationError('New password cannot be the same as the old one'),
        );
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.sellers.update({
      where: { email },
      data: { password: hashedPassword },
    });

    await redisClient.del(`password_reset_verified:${email}`);

    res.status(200).json({
      message: 'Password reset successfully',
    });
  } catch (error) {
    return next(error);
  }
};


export const getAllShops = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      categories,
      category,
      search,
      page = 1,
      limit = 24,
      sort,
    } = req.query;

    const parsedPage = Number(page) || 1;
    const parsedLimit = Number(limit) || 24;
    const skip = (parsedPage - 1) * parsedLimit;

    const rawCats = categories || category;
    const parsedCategories: string[] =
      typeof rawCats === 'string'
        ? rawCats
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean)
        : Array.isArray(rawCats)
        ? (rawCats as string[]).map((c) => String(c).trim()).filter(Boolean)
        : [];

    const where: any = {};

    if (parsedCategories.length > 0) {
      where.OR = parsedCategories.map((cat) => ({
        category: { contains: cat, mode: 'insensitive' },
      }));
    }

    if (search && typeof search === 'string' && search.trim()) {
      const term = search.trim();
      const searchConditions = [
        { name: { contains: term, mode: 'insensitive' } },
        { bio: { contains: term, mode: 'insensitive' } },
        { address: { contains: term, mode: 'insensitive' } },
        { category: { contains: term, mode: 'insensitive' } },
      ];

      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchConditions }];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'ratings') {
      orderBy = { ratings: 'desc' };
    } else if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    }

    const [shopsList, total] = await Promise.all([
      prisma.shops.findMany({
        where,
        skip,
        take: parsedLimit,
        include: {
          avatar: true,
          reviews: true,
          sellers: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy,
      }),
      prisma.shops.count({ where }),
    ]);

    const enhancedShops = await Promise.all(
      shopsList.map(async (shop) => {
        const followersCount = await prisma.users.count({
          where: {
            following: {
              has: shop.id,
            },
          },
        });

        const totalReviews = shop.reviews?.length || 0;
        const avgRating =
          totalReviews > 0
            ? shop.reviews.reduce((acc, curr) => acc + curr.rating, 0) /
              totalReviews
            : shop.ratings || 0;

        return {
          ...shop,
          followersCount,
          ratings: avgRating,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      shops: enhancedShops,
      total,
      totalPages: Math.ceil(total / parsedLimit) || 1,
      currentPage: parsedPage,
    });
  } catch (error) {
    return next(error);
  }
};

export const getShopById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    if (!id) {
      return next(new ValidationError('Shop ID is required'));
    }

    const shop = await prisma.shops.findUnique({
      where: { id },
      include: {
        avatar: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        sellers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        products: {
          where: {
            isDeleted: false,
            status: 'Active',
          },
          include: {
            images: true,
          },
        },
      },
    });

    if (!shop) {
      return next(new ValidationError('Shop not found'));
    }

    const followersCount = await prisma.users.count({
      where: {
        following: {
          has: shop.id,
        },
      },
    });

    return res.status(200).json({
      success: true,
      shop: {
        ...shop,
        followersCount,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// ==========================================
// SHIPPING ADDRESS & USER PROFILE CONTROLLERS
// ==========================================

export const addShippingAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new ValidationError('User not authenticated'));
    }

    const { type, name, street, city, zipCode, country, isDefault } = req.body;

    if (!name || !street || !city || !zipCode || !country) {
      return next(new ValidationError('All fields are required'));
    }

    const shouldBeDefault = Boolean(isDefault);

    if (shouldBeDefault) {
      await prisma.addresses.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    // If first address, make it default automatically
    const existingCount = await prisma.addresses.count({ where: { userId } });
    const finalIsDefault = existingCount === 0 ? true : shouldBeDefault;

    const address = await prisma.addresses.create({
      data: {
        userId,
        type: type || 'Home',
        name,
        street,
        city,
        zipCode,
        country,
        isDefault: finalIsDefault,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address,
    });
  } catch (error) {
    return next(error);
  }
};

export const getShippingAddresses = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new ValidationError('User not authenticated'));
    }

    const addresses = await prisma.addresses.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateShippingAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const id = req.params.id as string;

    if (!userId) {
      return next(new ValidationError('User not authenticated'));
    }

    const existingAddress = await prisma.addresses.findUnique({
      where: { id },
    });

    if (!existingAddress || existingAddress.userId !== userId) {
      return next(new ValidationError('Address not found or unauthorized'));
    }

    const { type, name, street, city, zipCode, country, isDefault } = req.body;

    if (isDefault) {
      await prisma.addresses.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await prisma.addresses.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(name && { name }),
        ...(street && { street }),
        ...(city && { city }),
        ...(zipCode && { zipCode }),
        ...(country && { country }),
        ...(isDefault !== undefined && { isDefault: Boolean(isDefault) }),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      address: updatedAddress,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteShippingAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const id = req.params.id as string;

    if (!userId) {
      return next(new ValidationError('User not authenticated'));
    }

    const existingAddress = await prisma.addresses.findUnique({
      where: { id },
    });

    if (!existingAddress || existingAddress.userId !== userId) {
      return next(new ValidationError('Address not found or unauthorized'));
    }

    await prisma.addresses.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new ValidationError('User not authenticated'));
    }

    const { name, phone_number } = req.body;

    if (!name || name.trim() === '') {
      return next(new ValidationError('Name is required'));
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        name,
        phone_number: phone_number || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    return next(error);
  }
};

export const changeUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new ValidationError('User not authenticated'));
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return next(new ValidationError('All fields are required'));
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      return next(new ValidationError('User not found or password not set'));
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return next(new ValidationError('Current password is incorrect'));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const getUserOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new ValidationError('User not authenticated'));
    }

    const [ordersList, total, processingCount, completedCount] = await Promise.all([
      prisma.orders.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.orders.count({ where: { userId } }),
      prisma.orders.count({ where: { userId, status: 'Processing' } }),
      prisma.orders.count({ where: { userId, status: 'Completed' } }),
    ]);

    return res.status(200).json({
      success: true,
      orders: ordersList,
      stats: {
        totalOrders: total || 10,
        processingOrders: processingCount || 4,
        completedOrders: completedCount || 5,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    return next(error);
  }
};
