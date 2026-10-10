'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { countries } from '../../utils/countries';

type FormData = {
  name: string;
  email: string;
  password: string;
  phone_number: string;
  country: string;
};

type VerifyUserData = {
  name: string;
  email: string;
  password: string;
  otp: string;
  phone_number: string;
  country: string;
};

type SocialLink = {
  title: string;
  url: string;
};

type ShopData = {
  name: string;
  bio: string;
  category: string;
  address: string;
  opening_hours: string;
  website?: string;
  socialLinks?: SocialLink[];
  sellerId?: string;
};

const SHOP_CATEGORIES = [
  'Fashion & Apparel',
  'Electronics & Gadgets',
  'Health & Beauty',
  'Home & Kitchen',
  'Grocery & Gourmet',
  'Sports & Fitness',
  'Books & Stationery',
  'Toys & Baby Products',
  'Jewelry & Accessories',
  'Automotive & Motorbike',
  'Art & Craft',
  'Other',
];

type ApiErrorResponse = {
  status?: string;
  message?: string;
  details?: Record<string, string>;
};

const RegisterPage = () => {
  const [activeState, setActiveState] = useState(3);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(60);
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [userData, setUserData] = useState<FormData | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [showOtp, setShowOtp] = useState(false);
  const [sellerId, setSellerId] = useState<string>('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const {
    register: registerShop,
    handleSubmit: handleSubmitShop,
    formState: { errors: shopErrors },
  } = useForm<ShopData>({
    defaultValues: {
      name: '',
      bio: '',
      category: '',
      address: '',
      opening_hours: '09:00 AM - 09:00 PM',
      website: '',
    },
  });

  const selectedCountryName = watch('country');
  const selectedCountry = countries.find((c) => c.name === selectedCountryName);

  useEffect(() => {
    if (!showOtp || timer <= 0) {
      if (timer <= 0) setCanResend(true);
      return;
    }

    const intervalId = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [showOtp, timer]);

  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/register-seller`,
        data,
      );
      return response.data;
    },
    onSuccess: (_, formData) => {
      setServerError(null);
      setUserData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      setOtp(['', '', '', '']);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const message =
        error.response?.data?.message ||
        'Failed to send registration OTP. Please try again.';
      setServerError(message);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: VerifyUserData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/verify-seller`,
        data,
      );
      return response.data;
    },
    onSuccess: (data: any) => {
      setServerError(null);
      if (data?.user?.id) {
        setSellerId(data.user.id);
      }
      setActiveState(2);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const message =
        error.response?.data?.message ||
        'OTP verification failed. Please try again.';
      setServerError(message);
    },
  });

  const createShopMutation = useMutation({
    mutationFn: async (data: ShopData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/create-shop`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      setServerError(null);
      setActiveState(3);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const message =
        error.response?.data?.message ||
        'Failed to create shop. Please try again.';
      setServerError(message);
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

  const verifyOtpCode = async () => {
    if (!userData) return;
    const otpValue = otp.join('');
    if (otpValue.length !== 4) {
      setServerError('Please enter a complete 4-digit OTP.');
      return;
    }
    setServerError(null);
    verifyOtpMutation.mutate({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      otp: otpValue,
      phone_number: userData.phone_number,
      country: userData.country,
    });
  };

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    signupMutation.mutate(data);
  };

  const handleShopSubmit = async (data: ShopData) => {
    setServerError(null);
    createShopMutation.mutate({
      ...data,
      sellerId: sellerId || data.sellerId || '',
    });
  };
  const resendOtp = () => {
    if (!userData || !canResend || signupMutation.isPending) return;
    setServerError(null);
    signupMutation.mutate(userData);
  };

  const connectStripe = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/create-stripe-link`,
        { sellerId: sellerId },
      );
      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Error connecting to Stripe:', error);
    }
  };

  return (
    <div className="w-full min-h-[85vh] bg-[#f5f5f5] py-12 flex flex-col items-center justify-center font-poppins">
      <div className="w-full max-w-[500px] px-4 mb-8">
        <div className="relative flex items-center justify-between">
          <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 -z-0">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{
                width:
                  activeState === 1 ? '0%' : activeState === 2 ? '50%' : '100%',
              }}
            />
          </div>

          {[
            { step: 1, label: 'Create Account' },
            { step: 2, label: 'Create Shop' },
            { step: 3, label: 'Setup bank' },
          ].map((item) => (
            <div
              key={item.step}
              className="relative z-10 flex flex-col items-center"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white transition-colors duration-200 ${
                  item.step <= activeState ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                {item.step}
              </div>
              <span
                className={`text-xs mt-2 font-medium whitespace-nowrap ${
                  item.step <= activeState
                    ? 'text-gray-900 font-semibold'
                    : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sign up</h1>
        <p className="text-xs text-gray-500 mt-1">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>{' '}
          . Sign up
        </p>
      </div>
      <div className="w-full max-w-[480px] bg-white rounded-lg shadow-sm border border-gray-100 p-8">
        {activeState === 1 ? (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Sign up to HashCart
              </h2>
              <p className="text-xs text-gray-500 mt-1.5">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-blue-600 font-medium hover:underline"
                >
                  Login
                </Link>
              </p>
            </div>

            {serverError && (
              <div className="mb-4 p-2.5 rounded-md bg-red-50 border border-red-200 text-red-600 text-xs">
                {serverError}
              </div>
            )}

            {!showOtp ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 rounded-md border border-gray-200 bg-[#eef3fb] focus:bg-white focus:border-blue-600 focus:outline-none text-xs text-gray-800 transition-colors"
                  />
                  {errors.name && (
                    <span className="text-[11px] text-red-500 mt-1 block">
                      {errors.name.message}
                    </span>
                  )}
                </div>
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
                      {...register('password', {
                        required: 'Password is required',
                      })}
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

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Country
                  </label>
                  <select
                    {...register('country', {
                      required: 'Country is required',
                    })}
                    defaultValue=""
                    className="w-full px-3.5 py-2.5 rounded-md border border-gray-200 bg-[#eef3fb] focus:bg-white focus:border-blue-600 focus:outline-none text-xs text-gray-800 transition-colors cursor-pointer"
                  >
                    <option value="" disabled>
                      Select your country
                    </option>
                    {countries.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <span className="text-[11px] text-red-500 mt-1 block">
                      {errors.country.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Phone Number
                  </label>
                  <Controller
                    name="phone_number"
                    control={control}
                    rules={{
                      required: 'Phone number is required',
                      validate: (value) =>
                        (value && isValidPhoneNumber(value)) ||
                        'Please enter a valid phone number',
                    }}
                    render={({ field: { onChange, value } }) => (
                      <div className="w-full px-3.5 py-2.5 rounded-md border border-gray-200 bg-[#eef3fb] focus-within:bg-white focus-within:border-blue-600 transition-colors">
                        <PhoneInput
                          key={selectedCountry?.code || 'default'}
                          international
                          defaultCountry={
                            selectedCountry
                              ? (selectedCountry.code as any)
                              : 'PK'
                          }
                          value={value}
                          onChange={onChange}
                          placeholder="Enter phone number"
                        />
                      </div>
                    )}
                  />
                  {errors.phone_number && (
                    <span className="text-[11px] text-red-500 mt-1 block">
                      {errors.phone_number.message}
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
                </div>

                <button
                  type="submit"
                  disabled={signupMutation.isPending}
                  className="w-full py-2.5 bg-black hover:bg-neutral-800 disabled:bg-gray-400 text-white font-medium text-xs rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
                >
                  {signupMutation.isPending && (
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
                    {signupMutation.isPending ? 'Signing up...' : 'Sign up'}
                  </span>
                </button>
              </form>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-1">
                  Verify OTP
                </h2>
                <p className="text-xs text-gray-500 text-center mb-6">
                  Enter the 4-digit code sent to your email
                </p>

                <div className="flex justify-center gap-3 mb-6">
                  {otp?.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      value={digit}
                      maxLength={1}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onChange={(e) => {
                        handleOtpChange(index, e.target.value);
                      }}
                      ref={(el) => {
                        if (el) {
                          inputRefs.current[index] = el;
                        }
                      }}
                      className="w-12 h-12 text-center text-lg font-bold rounded-md border border-gray-200 bg-[#eef3fb] focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={verifyOtpCode}
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
                    {verifyOtpMutation.isPending
                      ? 'Verifying...'
                      : 'Verify OTP'}
                  </span>
                </button>

                {canResend ? (
                  <div className="text-center mt-4">
                    <span className="text-xs text-gray-500">
                      Didn&apos;t receive code?{' '}
                    </span>
                    <button
                      type="button"
                      onClick={resendOtp}
                      disabled={signupMutation.isPending}
                      className="text-xs text-blue-600 hover:underline font-medium cursor-pointer disabled:text-gray-400"
                    >
                      {signupMutation.isPending ? 'Resending...' : 'Resend OTP'}
                    </button>
                  </div>
                ) : (
                  <p className="text-center my-3 text-xs text-gray-500">
                    {`Resend otp in ${timer} seconds`}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : activeState === 2 ? (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Setup your shop
              </h2>
              <p className="text-xs text-gray-500 mt-1.5">
                Tell us about your brand to launch your storefront
              </p>
            </div>

            {serverError && (
              <div className="mb-4 p-2.5 rounded-md bg-red-50 border border-red-200 text-red-600 text-xs">
                {serverError}
              </div>
            )}

            <form
              onSubmit={handleSubmitShop(handleShopSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Shop Name *
                </label>
                <input
                  type="text"
                  {...registerShop('name', {
                    required: 'Shop name is required',
                  })}
                  placeholder="e.g. Hash Fashion Store"
                  className="w-full px-3.5 py-2.5 rounded-md border border-gray-200 bg-[#eef3fb] focus:bg-white focus:border-blue-600 focus:outline-none text-xs text-gray-800 transition-colors"
                />
                {shopErrors.name && (
                  <span className="text-[11px] text-red-500 mt-1 block">
                    {shopErrors.name.message}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Category *
                </label>
                <select
                  {...registerShop('category', {
                    required: 'Category is required',
                  })}
                  defaultValue=""
                  className="w-full px-3.5 py-2.5 rounded-md border border-gray-200 bg-[#eef3fb] focus:bg-white focus:border-blue-600 focus:outline-none text-xs text-gray-800 transition-colors cursor-pointer"
                >
                  <option value="" disabled>
                    Select shop category
                  </option>
                  {SHOP_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {shopErrors.category && (
                  <span className="text-[11px] text-red-500 mt-1 block">
                    {shopErrors.category.message}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Shop Bio *
                </label>
                <textarea
                  rows={3}
                  {...registerShop('bio', { required: 'Shop bio is required' })}
                  placeholder="Tell customers about your products and brand story..."
                  className="w-full px-3.5 py-2.5 rounded-md border border-gray-200 bg-[#eef3fb] focus:bg-white focus:border-blue-600 focus:outline-none text-xs text-gray-800 transition-colors resize-none"
                />
                {shopErrors.bio && (
                  <span className="text-[11px] text-red-500 mt-1 block">
                    {shopErrors.bio.message}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Business Address *
                </label>
                <input
                  type="text"
                  {...registerShop('address', {
                    required: 'Business address is required',
                  })}
                  placeholder="Shop / Office address, City"
                  className="w-full px-3.5 py-2.5 rounded-md border border-gray-200 bg-[#eef3fb] focus:bg-white focus:border-blue-600 focus:outline-none text-xs text-gray-800 transition-colors"
                />
                {shopErrors.address && (
                  <span className="text-[11px] text-red-500 mt-1 block">
                    {shopErrors.address.message}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Opening Hours *
                  </label>
                  <input
                    type="text"
                    {...registerShop('opening_hours', {
                      required: 'Opening hours are required',
                    })}
                    placeholder="e.g. 09:00 AM - 09:00 PM"
                    className="w-full px-3.5 py-2.5 rounded-md border border-gray-200 bg-[#eef3fb] focus:bg-white focus:border-blue-600 focus:outline-none text-xs text-gray-800 transition-colors"
                  />
                  {shopErrors.opening_hours && (
                    <span className="text-[11px] text-red-500 mt-1 block">
                      {shopErrors.opening_hours.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Website{' '}
                    <span className="text-gray-400 font-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="url"
                    {...registerShop('website')}
                    placeholder="https://yourshop.com"
                    className="w-full px-3.5 py-2.5 rounded-md border border-gray-200 bg-[#eef3fb] focus:bg-white focus:border-blue-600 focus:outline-none text-xs text-gray-800 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveState(1)}
                  className="w-1/3 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-xs rounded-md transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={createShopMutation.isPending}
                  className="flex-1 py-2.5 bg-black hover:bg-neutral-800 disabled:bg-gray-400 text-white font-medium text-xs rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {createShopMutation.isPending && (
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
                    {createShopMutation.isPending
                      ? 'Creating Shop...'
                      : 'Create Shop & Continue'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900">
              Withdraw Method
            </h3>
            <br />
            <button
              onClick={connectStripe}
              className="w-full py-3 text-white rounded hover:cursor-pointer m-auto flex items-center justify-center gap-3 text-lg bg-gray-500 "
            >
              Connect Stripe
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
