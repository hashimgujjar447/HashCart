import crypto from 'node:crypto';
import { ValidationError } from '../../../../packages/error-handler';
import { redisClient } from '../../../../packages/redis/redis';
import { sendEmail } from './sendMail';
import { NextFunction, Request, Response } from 'express';
import prisma from '../../../../packages/libs/prisma';

export const validateRegistrationData = (
  data: any,
  userType: 'user' | 'seller',
) => {
  const { name, email, password, phone_number, country } = data;
  if (
    !name ||
    !email ||
    !password ||
    (userType === 'seller' && (!phone_number || !country))
  ) {
    throw new ValidationError('Missing required fields');
  }
};

export const checkOtpValidation = async (email: string) => {
  if (await redisClient.get(`otp_lock:${email}`)) {
    throw new ValidationError(
      'Account is locked due to multiple failed attempts! Try again after 30 min',
    );
  }
  if (await redisClient.get(`otp_spam_lock:${email}`)) {
    throw new ValidationError(
      'Too many OTP requests! Please wait for 1 hour before requesting again',
    );
  }

  if (await redisClient.get(`otp_cooldown:${email}`)) {
    throw new ValidationError(
      'Please wait one minute before requesting a new otp',
    );
  }
};

export const trackOtpRequests = async (email: string) => {
  const otpRequestKey = `otp_request_count:${email}`;

  let otpRequests = parseInt((await redisClient.get(otpRequestKey)) || '0');
  if (otpRequests >= 2) {
    await redisClient.set(`otp_spam_lock:${email}`, 'locked', {
      EX: 3600,
    });
    throw new ValidationError(
      'Too many Otp requests please wait 1 hour before requesting again.',
    );
  }

  await redisClient.set(otpRequestKey, Number(otpRequests) + 1, {
    EX: 3600,
  });
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string,
) => {
  const otp = crypto.randomInt(1000, 10000).toString();

  await sendEmail(email, 'Verify Your Email', template, { name, otp });

  await redisClient.set(`otp:${email}`, otp, {
    EX: 300, // 5 minutes
  });

  await redisClient.set(`otp_cooldown:${email}`, 'true', {
    EX: 60, // 60 seconds
  });
};

// Verify OTP

export const verifyOtp = async (email: string, otp: string) => {
  const userOtp = await redisClient.get(`otp:${email}`);

  if (!userOtp) {
    throw new ValidationError('OTP has expired. Please request a new one.');
  }

  const failedAttemptsKey = `otp_failed_attempts:${email}`;
  let failedAttempts = parseInt(
    (await redisClient.get(failedAttemptsKey)) || '0',
  );

  if (userOtp !== otp) {
    if (failedAttempts >= 2) {
      await redisClient.set(`otp_lock:${email}`, 'locked', {
        EX: 1800, // 30 minutes
      });
      await redisClient.del(`otp:${email}`);

      throw new ValidationError(
        'Account is locked due to multiple failed attempts! Try again after 30 min',
      );
    }

    await redisClient.set(failedAttemptsKey, failedAttempts + 1, {
      EX: 1800, // 30 minutes
    });

    throw new ValidationError(
      `Incorrect OTP. You have ${2 - failedAttempts} attempts left.`,
    );
  }

  // clean up after successful verification
  await redisClient.del(`otp:${email}`);
  await redisClient.del(failedAttemptsKey);
};

// handle forget password

export const handleForgetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
  userType: 'user' | 'seller',
) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new ValidationError('Email is required'));
    }
    const user =
      userType === 'user' &&
      (await prisma.users.findUnique({ where: { email } }));

    if (!user) {
      return next(new ValidationError(`No ${userType} found with this email`));
    }
    await checkOtpValidation(email);
    await trackOtpRequests(email);

    await sendOtp(
      user.name,
      email,
      userType === 'user'
        ? 'user-forget-password-mail'
        : 'seller-forget-password-mail',
    );

    return res.status(200).json({
      message: 'Otp send to email please verify your account',
    });
  } catch (error) {
    return next(error);
  }
};

export const verifyForgetPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new ValidationError('Email and OTP are required'));
    }

    if (otp.length !== 4) {
      return next(new ValidationError('OTP must be 4 digits long'));
    }

    await verifyOtp(email, otp);

    res.status(200).json({
      message: 'OTP verified successfully',
    });
  } catch (error) {
    next(error);
  }
};
