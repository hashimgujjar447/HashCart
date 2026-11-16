'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Plus, Sparkles, Tag } from 'lucide-react';

export default function AllEventsPage() {
  return (
    <div className="w-full max-w-[1200px] mx-auto py-12 px-4 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
        <Calendar className="w-8 h-8" />
      </div>

      <div className="max-w-md mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Seasonal Campaigns</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Store Events & Flash Sales
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Run limited-time flash discounts, holiday mega-sales, and promotional
          events to accelerate store orders.
        </p>
      </div>

      <div className="p-8 max-w-lg mx-auto rounded-2xl bg-[#0c121e] border border-slate-800 text-left space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              Instant Discount Codes Available
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              You can currently create and manage active promo coupons for your
              products in the Discount Codes section.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/dashboard/discount-codes"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            <span>Manage Coupon Codes</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
