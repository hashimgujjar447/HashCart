import crypto from 'node:crypto';
import { ValidationError } from '../../../../packages/error-handler';
import { redisClient } from '../../../../packages/redis/redis';
import { sendEmail } from './sendMail';

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
    throw new ValidationError('Please wait one minute before requesting a new otp');
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
