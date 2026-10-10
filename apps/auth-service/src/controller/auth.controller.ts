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

import prisma from '../../../../packages/libs/prisma';
import { AuthError, ValidationError } from '../../../../packages/error-handler';
import { redisClient } from '../../../../packages/redis/redis';
import bcrypt from 'bcryptjs';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { setCookie } from '../utils/cookies/setCookie';

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

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return next(new ValidationError('Invalid email or password'));
    }

    const isMatchingPassword = await bcrypt.compare(password, user.password!);
    if (!isMatchingPassword) {
      return next(new ValidationError('Invalid email or password'));
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: '15m' },
    );

    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: '7d' },
    );

    setCookie(res, 'accessToken', accessToken);
    setCookie(res, 'refreshToken', refreshToken);

    res.status(200).json({
      message: 'User logged in successfully',
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
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return next(new ValidationError('Refresh token is required'));
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
    ) as { userId: string; email: string; role: string };

    if (!decoded || !decoded.userId || !decoded.email) {
      return next(new JsonWebTokenError('Invalid refresh token'));
    }

    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) {
      return next(new AuthError("Forbidden: User/Seller doesn't exist"));
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: '15m' },
    );

    setCookie(res, 'accessToken', accessToken);

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
    res.status(200).json({
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
