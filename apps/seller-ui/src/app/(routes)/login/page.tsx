'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

type FormData = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/login`,
        data,
      );
      return response.data;
    },
    onSuccess: (data) => {
      console.log('User logged in successfully:', data);
      setServerError(null); // Clear any previous error
      router.push('/');
    },
    onError: (error: any) => {
      console.error(
        'Login failed:',
        error.response?.data?.message || error.message,
      );
      setServerError(
        error.response?.data?.message || 'An error occurred during login',
      );
    },
    // Handle error, e.g., show a notification or set an error state
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full min-h-[85vh] bg-[#f5f5f5] py-12 flex flex-col items-center justify-center font-poppins">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Login</h1>
        <p className="text-xs text-gray-500 mt-1">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>{' '}
          . Login
        </p>
      </div>

      <div className="w-full max-w-[440px] bg-white rounded-lg shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Login to HashCart
          </h2>
          <p className="text-xs text-gray-500 mt-1.5">
            Don&apos;t have an account?{' '}
            <Link
              href="/sign-up"
              className="text-blue-600 font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>

        {serverError && (
          <div className="mb-4 p-2.5 rounded-md bg-red-50 border border-red-200 text-red-600 text-xs">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              placeholder="Enter your email"
              className="w-full px-3.5 py-2.5 rounded-md border border-gray-200 bg-[#eef3fb] focus:bg-white focus:border-blue-600 focus:outline-none text-xs text-gray-800 transition-colors"
            />
            {errors.email && (
              <span className="text-[11px] text-red-500 mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={passwordVisible ? 'text' : 'password'}
                {...register('password', { required: 'Password is required' })}
                placeholder="Enter your password"
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
            {errors.password && (
              <span className="text-[11px] text-red-500 mt-1 block">
                {errors.password.message}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-300 accent-black cursor-pointer"
              />
              <span>Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-blue-600 hover:underline font-medium"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white font-medium text-xs rounded-md transition-colors cursor-pointer mt-2"
          >
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
