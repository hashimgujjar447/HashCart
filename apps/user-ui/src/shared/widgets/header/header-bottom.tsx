'use client';
import React, { useEffect, useState } from 'react';
import { navItems } from '@/config/constants';
import Link from 'next/link';

const HeaderBottom = () => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`w-full transition-all duration-300 font-poppins ${
        isSticky
          ? 'fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-100 py-2'
          : 'bg-white border-t border-gray-100'
      }`}
    >
      <div className="w-[88%] max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: All Departments Button */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-3 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-t-md transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>All Departments</span>
            <svg className="w-4 h-4 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Center: Navigation Links */}
        <nav className="flex items-center gap-8">
          {navItems?.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Right: User / Wishlist / Cart (Only on sticky scroll as in reference) */}
        {isSticky && (
          <div className="flex items-center gap-5">
            <Link href="/login" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[11px] text-gray-400">Hello,</span>
                <span className="text-xs font-bold text-gray-800">Sign In</span>
              </div>
            </Link>

            <Link href="/wishlist" className="relative p-1 text-gray-700 hover:text-blue-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                0
              </span>
            </Link>

            <Link href="/cart" className="relative p-1 text-gray-700 hover:text-blue-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                0
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderBottom;
