'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Headphones,
  Store,
  ArrowUpRight,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#0a0f1d] text-slate-300 font-poppins border-t border-slate-800/80 mt-16">
      {/* 1. Value Proposition Trust Bar */}
      <div className="border-b border-slate-800/60">
        <div className="w-[88%] max-w-7xl mx-auto py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  Verified Merchants
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  100% authentic curated stores
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  Secure Checkout
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Encrypted Stripe & Card payments
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  Tracked Delivery
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Live 4-step order progress
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  Customer Care
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Support & easy returns
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Links (Clean & Simple) */}
      <div className="w-[88%] max-w-7xl mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-poppins font-black text-2xl tracking-tight text-white">
                Hash<span className="text-blue-500">Cart</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Your trusted multi-vendor marketplace connecting verified sellers
              with smart buyers. Shop authentic products with live tracking and
              buyer protection.
            </p>

            <div className="pt-2">
              <a
                href="http://localhost:3001"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 transition-all"
              >
                <Store size={14} />
                <span>Open a Seller Account</span>
                <ArrowUpRight size={13} />
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">
              Shop & Explore
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link
                  href="/products"
                  className="hover:text-white transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/shops"
                  className="hover:text-white transition-colors"
                >
                  Featured Stores
                </Link>
              </li>
              <li>
                <Link
                  href="/offers"
                  className="hover:text-white transition-colors"
                >
                  Special Deals
                </Link>
              </li>
              <li>
                <Link
                  href="/wishlist"
                  className="hover:text-white transition-colors"
                >
                  Saved Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support Column */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">
              Customer Account
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link
                  href="/profile"
                  className="hover:text-white transition-colors"
                >
                  My Profile
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="hover:text-white transition-colors"
                >
                  Track Orders
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="hover:text-white transition-colors"
                >
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="hover:text-white transition-colors"
                >
                  Shipping Addresses
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Merchants */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">
              For Merchants
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a
                  href="http://localhost:3001/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>Seller Dashboard</span>
                  <ArrowUpRight size={11} className="text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="http://localhost:3001/dashboard/payments"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Stripe Payouts
                </a>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">
                  90% Revenue Share
                </span>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">
                  Verified Seller Policy
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Bottom Legal & Payment Badges Bar */}
      <div className="border-t border-slate-800/60 py-6 bg-[#080c18]">
        <div className="w-[88%] max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} HashCart Inc.</span>
            <span>•</span>
            <span>Built with Next.js & Microservices</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-400">
              Stripe Verified
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-400">
              Visa / Mastercard
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-400">
              Cash on Delivery
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
