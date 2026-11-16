'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarPlus, ArrowRight, TicketPercent } from 'lucide-react';

export default function CreateEventPage() {
  return (
    <div className="w-full max-w-[1200px] mx-auto py-12 px-4 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto">
        <CalendarPlus className="w-8 h-8" />
      </div>

      <div className="max-w-md mx-auto space-y-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Create Promotional Event
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Event scheduling is being enhanced. In the meantime, you can configure
          store coupons and promotional discount codes.
        </p>
      </div>

      <div className="pt-2">
        <Link
          href="/dashboard/discount-codes"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition"
        >
          <TicketPercent className="w-4 h-4" />
          <span>Go to Discount Codes</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
