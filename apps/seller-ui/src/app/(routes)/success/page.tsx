'use client';

import Link from 'next/link';

const SuccessPage = () => {
  return (
    <div className="w-full min-h-screen bg-[#f5f5f5] flex items-center justify-center font-poppins px-4">
      <div className="w-full max-w-[520px] bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center text-center">
        {/* Animated checkmark circle */}
        <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mb-6 animate-bounce-once">
          <svg
            className="w-12 h-12 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Stripe logo badge */}
        <div className="flex items-center gap-2 bg-[#f0f4ff] border border-blue-100 rounded-full px-4 py-1.5 mb-6">
          <svg
            className="w-4 h-4 text-blue-600"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.946 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
          </svg>
          <span className="text-blue-600 text-sm font-semibold">
            Stripe Connected
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Account Setup Complete!
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Your Stripe account has been successfully connected. You can now
          receive payments from customers directly to your bank account.
        </p>

        {/* Info cards */}
        <div className="w-full grid grid-cols-3 gap-3 mb-8">
          {[
            {
              icon: (
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              ),
              label: 'Secure',
            },
            {
              icon: (
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              ),
              label: 'Instant',
            },
            {
              icon: (
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              ),
              label: 'Payouts',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 bg-[#f8faff] border border-blue-50 rounded-xl py-4"
            >
              {item.icon}
              <span className="text-xs font-semibold text-gray-600">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-100 mb-6" />

        {/* CTA Buttons */}
        <div className="w-full flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 text-white font-semibold py-3 rounded-xl text-sm"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="w-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors duration-200 text-gray-700 font-semibold py-3 rounded-xl text-sm"
          >
            Back to Home
          </Link>
        </div>

        {/* Footer note */}
        <p className="text-xs text-gray-400 mt-6">
          Payments are processed securely by{' '}
          <span className="text-blue-500 font-medium">Stripe</span>. Need help?{' '}
          <a href="#" className="text-blue-500 hover:underline font-medium">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;