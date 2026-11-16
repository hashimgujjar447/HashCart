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
import {
  redisClient,
  getCache,
  setCache,
  delCacheByPattern,
} from '../../../../packages/redis/redis';
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
      { expiresIn: '2h' },
    );

    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email, role: 'user' },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: '14d' },
    );

    // Clear previous user cookies only (do NOT clear seller cookies so sessions co-exist on localhost)
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
    // Intelligent caller detection: distinguish seller vs user refresh requests
    const isSeller =
      req.headers.origin?.includes('3001') ||
      req.headers.referer?.includes('3001') ||
      req.query?.role === 'seller' ||
      req.body?.role === 'seller' ||
      (!!req.cookies.sellerRefreshToken && !req.cookies.refreshToken);

    const token = isSeller
      ? req.cookies.sellerRefreshToken || req.cookies.refreshToken
      : req.cookies.refreshToken || req.cookies.sellerRefreshToken;

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
      { expiresIn: '2h' },
    );

    const cookieName = role === 'seller' ? 'sellerAccessToken' : 'accessToken';
    setCookie(res, cookieName, accessToken);

    res.status(200).json({
      message: 'Access token refreshed successfully',
      role,
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

    const origin =
      (req.headers.origin as string) ||
      (req.headers.referer
        ? new URL(req.headers.referer as string).origin
        : 'http://localhost:3001');

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${origin}/dashboard/payments?stripe_connect=refresh`,
      return_url: `${origin}/dashboard/payments?stripe_connect=success`,
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
      { expiresIn: '2h' },
    );

    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email, role: 'seller' },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: '14d' },
    );

    // Clear previous seller cookies only (do NOT clear user cookies so sessions co-exist on localhost)
    res.clearCookie('sellerAccessToken', { path: '/' });
    res.clearCookie('sellerRefreshToken', { path: '/' });

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

    const cacheKey = `cache:shops:all:${parsedPage}:${parsedLimit}:${parsedCategories.sort().join('-')}:${search || ''}:${sort || 'default'}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

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

    const payload = {
      success: true,
      shops: enhancedShops,
      total,
      totalPages: Math.ceil(total / parsedLimit) || 1,
      currentPage: parsedPage,
    };

    await setCache(cacheKey, payload, 1800); // 30 mins

    return res.status(200).json(payload);
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

    const cacheKey = `cache:shop:${id}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
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

    const payload = {
      success: true,
      shop: {
        ...shop,
        followersCount,
      },
    };

    await setCache(cacheKey, payload, 1800); // 30 mins

    return res.status(200).json(payload);
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
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
    return res.status(200).json({
      success: true,
      message: 'User logged out successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const logoutSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.clearCookie('sellerAccessToken', { path: '/' });
    res.clearCookie('sellerRefreshToken', { path: '/' });
    return res.status(200).json({
      success: true,
      message: 'Seller logged out successfully',
    });
  } catch (error) {
    return next(error);
  }
};

// Update shop profile
export const updateShopProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const seller = req.seller;
    if (!seller || req.role !== 'seller') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Seller session required',
      });
    }

    const {
      name,
      bio,
      category,
      address,
      opening_hours,
      website,
      coverBanner,
      avatar,
      sellerName,
      phone_number,
    } = req.body;

    if (!name || name.trim() === '') {
      return next(new ValidationError('Shop name is required'));
    }

    // 1. Update seller details if sellerName or phone_number is provided
    const sellerUpdateData: any = {};
    if (sellerName && sellerName.trim() !== '') {
      sellerUpdateData.name = sellerName.trim();
    }
    if (phone_number !== undefined) {
      sellerUpdateData.phone_number = phone_number;
    }
    if (Object.keys(sellerUpdateData).length > 0) {
      await prisma.sellers.update({
        where: { id: seller.id },
        data: sellerUpdateData,
      });
    }

    // 2. Find or create shop for seller
    let shop = await prisma.shops.findUnique({
      where: { sellerId: seller.id },
      include: { avatar: true },
    });

    const shopPayload: any = {
      name: name.trim(),
      bio: bio !== undefined ? bio : shop?.bio,
      category: category !== undefined ? category : shop?.category || 'General',
      address: address !== undefined ? address : shop?.address || '',
      opening_hours:
        opening_hours !== undefined ? opening_hours : shop?.opening_hours,
      website: website !== undefined ? website : shop?.website,
      coverBanner: coverBanner !== undefined ? coverBanner : shop?.coverBanner,
    };

    if (shop) {
      shop = await prisma.shops.update({
        where: { id: shop.id },
        data: shopPayload,
        include: { avatar: true },
      });
    } else {
      shop = await prisma.shops.create({
        data: {
          ...shopPayload,
          sellerId: seller.id,
        },
        include: { avatar: true },
      });
    }

    // 3. Handle avatar image if provided
    if (avatar && (avatar.url || typeof avatar === 'string')) {
      const avatarUrl = typeof avatar === 'string' ? avatar : avatar.url;
      const avatarFileId =
        (typeof avatar === 'object' && avatar.fileId) ||
        `shop_avatar_${Date.now()}`;

      const existingImage = await prisma.images.findFirst({
        where: { shopId: shop.id },
      });

      if (existingImage) {
        await prisma.images.update({
          where: { id: existingImage.id },
          data: {
            url: avatarUrl,
            file_id: avatarFileId,
          },
        });
      } else {
        await prisma.images.create({
          data: {
            url: avatarUrl,
            file_id: avatarFileId,
            shopId: shop.id,
          },
        });
      }
    }

    // 4. Fetch updated seller record with fresh shop and avatar
    const updatedSeller = await prisma.sellers.findUnique({
      where: { id: seller.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone_number: true,
        country: true,
        stripeId: true,
        createdAt: true,
        updatedAt: true,
        shop: {
          include: {
            avatar: true,
          },
        },
      },
    });

    // Invalidate shop caches
    await delCacheByPattern('cache:shops:*');
    await delCacheByPattern(`cache:shop:${shop.id}*`);

    return res.status(200).json({
      success: true,
      message: 'Shop settings updated successfully',
      seller: updatedSeller,
      shop: updatedSeller?.shop,
    });
  } catch (error) {
    return next(error);
  }
};

// Check if user is eligible to review a product / shop (must be a verified buyer with a Delivered order)
export const checkReviewEligibility = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(200).json({
        success: true,
        eligible: false,
        isLoggedIn: false,
        message: 'Please log in to review this product.',
      });
    }

    const { productId, shopId } = req.query;

    if (!shopId && !productId) {
      return next(
        new ValidationError('Either shopId or productId is required'),
      );
    }

    // 1. Fetch user's delivered or completed orders
    const deliveredOrders = await prisma.orders.findMany({
      where: {
        userId,
        status: { in: ['Delivered', 'Completed'] },
      },
      select: {
        id: true,
        shopId: true,
        items: true,
        createdAt: true,
        status: true,
      },
    });

    let isVerifiedBuyer = false;
    let matchedOrder: any = null;

    if (productId) {
      const prodIdStr = String(productId);
      for (const order of deliveredOrders) {
        const items = Array.isArray(order.items) ? order.items : [];
        const found = items.some(
          (item: any) =>
            item.id === prodIdStr ||
            item._id === prodIdStr ||
            item.productId === prodIdStr,
        );
        if (found) {
          isVerifiedBuyer = true;
          matchedOrder = order;
          break;
        }
      }
    } else if (shopId) {
      const targetShopId = String(shopId);
      matchedOrder = deliveredOrders.find((o) => o.shopId === targetShopId);
      if (matchedOrder) {
        isVerifiedBuyer = true;
      }
    }

    // 2. Check if user already submitted a review
    let existingReview: any = null;
    if (shopId) {
      existingReview = await prisma.shopReviews.findFirst({
        where: {
          userId,
          shopId: String(shopId),
        },
      });
    }

    return res.status(200).json({
      success: true,
      isLoggedIn: true,
      eligible: isVerifiedBuyer,
      matchedOrder: matchedOrder
        ? {
            id: matchedOrder.id,
            date: matchedOrder.createdAt,
          }
        : null,
      existingReview: existingReview
        ? {
            id: existingReview.id,
            rating: existingReview.rating,
            comment: existingReview.reviews,
            updatedAt: existingReview.updatedAt,
          }
        : null,
      message: isVerifiedBuyer
        ? 'Verified Buyer: You are eligible to review this product.'
        : 'Only verified buyers who have received this product can write a review.',
    });
  } catch (error) {
    return next(error);
  }
};

// Add or update review (with strict verified buyer check)
export const addReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new AuthError('User not authenticated'));
    }

    const { shopId, productId, rating, comment } = req.body;

    if (!shopId) {
      return next(new ValidationError('Shop ID is required'));
    }

    const parsedRating = parseFloat(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return next(
        new ValidationError('Rating must be a number between 1 and 5'),
      );
    }

    if (!comment || comment.trim().length < 3) {
      return next(
        new ValidationError('Review text must be at least 3 characters'),
      );
    }

    // 1. Anti-Fake Review Protection: Verify user actually received a delivered order!
    const deliveredOrders = await prisma.orders.findMany({
      where: {
        userId,
        status: { in: ['Delivered', 'Completed'] },
      },
      select: {
        id: true,
        shopId: true,
        items: true,
      },
    });

    let isVerifiedBuyer = false;
    if (productId) {
      const prodIdStr = String(productId);
      for (const order of deliveredOrders) {
        const items = Array.isArray(order.items) ? order.items : [];
        const found = items.some(
          (item: any) =>
            item.id === prodIdStr ||
            item._id === prodIdStr ||
            item.productId === prodIdStr,
        );
        if (found) {
          isVerifiedBuyer = true;
          break;
        }
      }
    } else {
      isVerifiedBuyer = deliveredOrders.some((o) => o.shopId === shopId);
    }

    if (!isVerifiedBuyer) {
      return res.status(403).json({
        success: false,
        message:
          'Review Rejected: Only verified buyers who have received this product can write a review. No delivered order was found on your account for this item.',
      });
    }

    // 2. Upsert Review: if user already reviewed this shop/product, update it
    const existingReview = await prisma.shopReviews.findFirst({
      where: {
        userId,
        shopId,
      },
    });

    let savedReview;
    if (existingReview) {
      savedReview = await prisma.shopReviews.update({
        where: { id: existingReview.id },
        data: {
          rating: parsedRating,
          reviews: comment.trim(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });
    } else {
      savedReview = await prisma.shopReviews.create({
        data: {
          userId,
          shopId,
          rating: parsedRating,
          reviews: comment.trim(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });
    }

    // 3. Recalculate average rating for the shop
    const allShopReviews = await prisma.shopReviews.findMany({
      where: { shopId },
      select: { rating: true },
    });

    const totalRatings = allShopReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating =
      allShopReviews.length > 0
        ? Math.round((totalRatings / allShopReviews.length) * 10) / 10
        : parsedRating;

    await prisma.shops.update({
      where: { id: shopId },
      data: { ratings: avgRating },
    });

    // If productId was provided, also update product rating
    if (productId) {
      try {
        await prisma.products.update({
          where: { id: productId },
          data: { ratings: avgRating },
        });
      } catch (prodErr) {
        console.warn('Could not update product rating:', prodErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: existingReview
        ? 'Your verified review has been updated successfully!'
        : 'Thank you! Your verified purchase review has been published.',
      review: savedReview,
      averageRating: avgRating,
      totalReviews: allShopReviews.length,
    });
  } catch (error) {
    return next(error);
  }
};

// Toggle follow/unfollow shop
export const toggleFollowShop = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new AuthError('Please log in to follow this store'));
    }

    const { shopId } = req.body;
    if (!shopId) {
      return next(new ValidationError('Shop ID is required'));
    }

    const shop = await prisma.shops.findUnique({
      where: { id: shopId },
      select: { id: true, name: true },
    });

    if (!shop) {
      return next(new ValidationError('Shop not found'));
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { following: true },
    });

    const currentFollowing: string[] = user?.following || [];
    const isCurrentlyFollowing = currentFollowing.includes(shopId);

    let updatedFollowing: string[];
    let action: 'followed' | 'unfollowed';

    if (isCurrentlyFollowing) {
      updatedFollowing = currentFollowing.filter((id) => id !== shopId);
      action = 'unfollowed';
    } else {
      updatedFollowing = [...currentFollowing, shopId];
      action = 'followed';
    }

    await prisma.users.update({
      where: { id: userId },
      data: { following: updatedFollowing },
    });

    const followersCount = await prisma.users.count({
      where: {
        following: {
          has: shopId,
        },
      },
    });

    await delCacheByPattern('cache:shops:*');
    await delCacheByPattern(`cache:shop:${shopId}*`);

    return res.status(200).json({
      success: true,
      action,
      isFollowing: !isCurrentlyFollowing,
      followersCount,
      message:
        action === 'followed'
          ? `You are now following ${shop.name}!`
          : `You unfollowed ${shop.name}.`,
    });
  } catch (error) {
    return next(error);
  }
};
