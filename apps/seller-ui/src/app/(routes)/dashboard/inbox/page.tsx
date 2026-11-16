'use client';

import React from 'react';
import { Mail, MessageSquare, Sparkles } from 'lucide-react';

export default function InboxPage() {
  return (
    <div className="w-full max-w-[1200px] mx-auto py-12 px-4 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto">
        <Mail className="w-8 h-8" />
      </div>

      <div className="max-w-md mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Feature In Development</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Seller Messages & Inbox
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Real-time customer inquiries, buyer negotiations, and order support
          messaging will appear here.
        </p>
      </div>

      <div className="p-8 max-w-lg mx-auto rounded-2xl bg-[#0c121e] border border-slate-800 text-left space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              Direct Buyer Messaging
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Buyers can chat directly with your store regarding product
              questions and delivery updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
