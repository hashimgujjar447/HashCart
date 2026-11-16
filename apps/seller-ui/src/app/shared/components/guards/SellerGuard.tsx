'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSeller } from '@/app/hooks/useSeller';
import { Loader2, ShieldCheck, Lock } from 'lucide-react';

interface SellerGuardProps {
  children: React.ReactNode;
}

export default function SellerGuard({ children }: SellerGuardProps) {
  const { seller, isLoading } = useSeller();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If auth verification finished and seller is not logged in, redirect to /login
    if (!isLoading && !seller) {
      const redirectUrl =
        pathname && pathname !== '/dashboard'
          ? `/login?redirect=${encodeURIComponent(pathname)}`
          : '/login';
      router.replace(redirectUrl);
    }
  }, [seller, isLoading, router, pathname]);

  // Loading state while checking seller authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#0e131f] border border-slate-800/80 rounded-2xl p-8 flex flex-col items-center text-center shadow-2xl">
          <div className="relative mb-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-8 h-8 text-blue-500" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
              <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
            </div>
          </div>

          <h3 className="text-base font-bold text-white tracking-tight">
            Verifying Seller Portal
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            Authenticating your seller credentials and workspace access...
          </p>

          <div className="w-full bg-slate-800/60 rounded-full h-1 mt-6 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full w-2/3 animate-pulse rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // If unauthorized, do not render dashboard content while redirect is in flight
  if (!seller) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#0e131f] border border-slate-800/80 rounded-2xl p-8 flex flex-col items-center text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Access Restricted
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Redirecting to seller login...
          </p>
        </div>
      </div>
    );
  }

  // Seller is authenticated, render protected dashboard
  return <>{children}</>;
}
