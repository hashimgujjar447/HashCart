import Link from 'next/link';
import React from 'react';
import HeaderBottom from './header/header-bottom';

const Header = () => {
  return (
    <header className="w-full bg-white border-b border-gray-100 shadow-xs  z-50">
      <div className="w-[88%] max-w-7xl mx-auto py-3.5 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="font-poppins font-extrabold text-2xl tracking-tight text-gray-900">
            Hash<span className="text-blue-600">Cart</span>
          </span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl relative">
          <div className="flex items-center w-full rounded-full border border-gray-200 bg-gray-50/60 hover:bg-white focus-within:bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
            <input
              type="text"
              placeholder="Search products, brands and categories..."
              className="w-full px-5 py-2.5 bg-transparent font-poppins text-sm text-gray-800 placeholder-gray-400 outline-none"
            />
            <button
              type="button"
              className="mr-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer shadow-xs"
              aria-label="Search"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.35 4.35a7.5 7.5 0 0012.3 12.3z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-3 shrink-0 font-poppins">
          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-full transition-colors relative"
            title="Wishlist"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-full transition-colors relative"
            title="Cart"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span className="absolute 1 top-1 right-1 bg-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              0
            </span>
          </Link>

          {/* User Sign In */}
          <Link
            href="/login"
            className="flex items-center gap-2 pl-2 pr-4 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-full border border-gray-200 transition-colors"
          >
            <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </span>
            <span>Sign In</span>
          </Link>
        </div>
      </div>
      <HeaderBottom />
    </header>
  );
};

export default Header;
