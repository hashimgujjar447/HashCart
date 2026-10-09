'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';

type ForgotPasswordForm = {
  email: string;
};

type ResetPasswordForm = {
  password: string;
  confirmPassword: string;
};

type ApiErrorResponse = {
  status?: string;
  message?: string;
};

const ForgetPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [canResendOtp, setCanResendOtp] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(60);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
  } = useForm<ForgotPasswordForm>();

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    watch: watchReset,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordForm>();

  useEffect(() => {
    if (step !== 'otp' || timer <= 0) {
      if (timer <= 0) setCanResendOtp(true);
      return;
    }

    const intervalId = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [step, timer]);

  const sendOtpMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/forgot-password`,
        { email },
      );
      return response.data;
    },
    onSuccess: (_, email) => {
      setServerError(null);
      setUserEmail(email);
      setStep('otp');
      setCanResendOtp(false);
      setTimer(60);
      setOtp(['', '', '', '']);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      setServerError(
        error.response?.data?.message ||
          'Failed to send OTP. Please try again.',
      );
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/verify-forgot-password-otp`,
        { email, otp },
      );
      return response.data;
    },
    onSuccess: () => {
      setServerError(null);
      setStep('reset');
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      setServerError(
        error.response?.data?.message || 'Invalid or expired OTP code.',
      );
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({
      email,
      newPassword,
    }: {
      email: string;
      newPassword: string;
    }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/reset-password`,
        { email, newPassword },
      );
      return response.data;
    },
    onSuccess: () => {
      setServerError(null);
      setServerSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      setServerError(
        error.response?.data?.message ||
          'Failed to reset password. Please try again.',
      );
    },
  });

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    setServerError(null);
    const oldOtp = [...otp];
    oldOtp[index] = value;
    setOtp(oldOtp);
    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onEmailSubmit = (data: ForgotPasswordForm) => {
    setServerError(null);
    sendOtpMutation.mutate(data.email);
  };

  const handleVerifyOtp = () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 4) {
      setServerError('Please enter a 4-digit OTP.');
      return;
    }
    setServerError(null);
    verifyOtpMutation.mutate({ email: userEmail, otp: otpValue });
  };

  const handleResendOtp = () => {
    if (!canResendOtp || sendOtpMutation.isPending) return;
    setServerError(null);
    sendOtpMutation.mutate(userEmail);
  };

  const onResetSubmit = (data: ResetPasswordForm) => {
    setServerError(null);
    resetPasswordMutation.mutate({
      email: userEmail,
      newPassword: data.password,
    });
  };

  return (
    <div className="w-full min-h-[85vh] bg-[#f5f5f5] py-12 flex flex-col items-center justify-center font-poppins">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Forgot Password</h1>
        <p className="text-xs text-gray-500 mt-1">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>{' '}
          .{' '}
          <Link href="/login" className="hover:text-blue-600">
            Login
          </Link>{' '}
          . Forgot Password
        </p>
      </div>

      <div className="w-full max-w-[440px] bg-white rounded-lg shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 'email'
              ? 'Forgot Password'
              : step === 'otp'
                ? 'Verify OTP'
                : 'Reset Password'}
          </h2>
          <p className="text-xs text-gray-500 mt-1.5">
            {step === 'email' && (
              <>
                Remember your password?{' '}
                <Link
                  href="/login"
                  className="text-blue-600 font-medium hover:underline"
                >
                  Login
                </Link>
              </>
            )}
            {step === 'otp' && 'Enter the 4-digit code sent to your email'}
            {step === 'reset' &&
              'Create a new secure password for your account'}
          </p>
        </div>

        {serverError && (
          <div className="mb-4 p-2.5 rounded-md bg-red-50 border border-red-200 text-red-600 text-xs">
            {serverError}
          </div>
        )}

        {serverSuccess && (
          <div className="mb-4 p-2.5 rounded-md bg-green-50 border border-green-200 text-green-700 text-xs">
            {serverSuccess}
          </div>
        )}

        {step === 'email' && (
          <form
            onSubmit={handleSubmitEmail(onEmailSubmit)}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                {...registerEmail('email', { required: 'Email is required' })}
                placeholder="Enter your registered email"
                className="w-full px-3.5 py-2.5 rounded-md border border-gray-200 bg-[#eef3fb] focus:bg-white focus:border-blue-600 focus:outline-none text-xs text-gray-800 transition-colors"
              />
              {emailErrors.email && (
                <span className="text-[11px] text-red-500 mt-1 block">
                  {emailErrors.email.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={sendOtpMutation.isPending}
              className="w-full py-2.5 bg-black hover:bg-neutral-800 disabled:bg-gray-400 text-white font-medium text-xs rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
            >
              {sendOtpMutation.isPending && (
                <svg
                  className="w-4 h-4 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              )}
              <span>
                {sendOtpMutation.isPending ? 'Sending OTP...' : 'Send OTP'}
              </span>
            </button>
          </form>
        )}

        {step === 'otp' && (
          <div>
            <div className="flex justify-center gap-3 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  value={digit}
                  maxLength={1}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  className="w-12 h-12 text-center text-lg font-bold rounded-md border border-gray-200 bg-[#eef3fb] focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={verifyOtpMutation.isPending}
              className="w-full py-2.5 bg-black hover:bg-neutral-800 disabled:bg-gray-400 text-white font-medium text-xs rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {verifyOtpMutation.isPending && (
                <svg
                  className="w-4 h-4 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              )}
              <span>
                {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
              </span>
            </button>

            {canResendOtp ? (
              <div className="text-center mt-4">
                <span className="text-xs text-gray-500">
                  Didn&apos;t receive code?{' '}
                </span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={sendOtpMutation.isPending}
                  className="text-xs text-blue-600 hover:underline font-medium cursor-pointer disabled:text-gray-400"
                >
                  {sendOtpMutation.isPending ? 'Resending...' : 'Resend OTP'}
                </button>
              </div>
            ) : (
              <p className="text-center my-3 text-xs text-gray-500">
                Resend OTP in {timer} seconds
              </p>
            )}
          </div>
        )}

        {step === 'reset' && (
          <form
            onSubmit={handleSubmitReset(onResetSubmit)}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  {...registerReset('password', {
                    required: 'New password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  placeholder="Enter your new password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-md border border-gray-200 bg-[#eef3fb] focus:bg-white focus:border-blue-600 focus:outline-none text-xs text-gray-800 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {passwordVisible ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {resetErrors.password && (
                <span className="text-[11px] text-red-500 mt-1 block">
                  {resetErrors.password.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={confirmPasswordVisible ? 'text' : 'password'}
                  {...registerReset('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (val) =>
                      val === watchReset('password') ||
                      'Passwords do not match',
                  })}
                  placeholder="Re-enter your new password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-md border border-gray-200 bg-[#eef3fb] focus:bg-white focus:border-blue-600 focus:outline-none text-xs text-gray-800 transition-colors"
                />
                <button
                  type="button"
                  onClick={() =>
                    setConfirmPasswordVisible(!confirmPasswordVisible)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {confirmPasswordVisible ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {resetErrors.confirmPassword && (
                <span className="text-[11px] text-red-500 mt-1 block">
                  {resetErrors.confirmPassword.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              className="w-full py-2.5 bg-black hover:bg-neutral-800 disabled:bg-gray-400 text-white font-medium text-xs rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
            >
              {resetPasswordMutation.isPending && (
                <svg
                  className="w-4 h-4 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              )}
              <span>
                {resetPasswordMutation.isPending
                  ? 'Resetting Password...'
                  : 'Reset Password'}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgetPage;
