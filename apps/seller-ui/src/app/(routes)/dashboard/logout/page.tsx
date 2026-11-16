'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/app/utils/axiosInstance';
import { LogOut } from 'lucide-react';

export default function LogoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await axiosInstance.post('/auth/logout');
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        queryClient.clear();
        router.replace('/login');
      }
    };

    performLogout();
  }, [router, queryClient]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
      <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 animate-pulse">
        <LogOut className="w-6 h-6" />
      </div>
      <h2 className="text-base font-semibold text-white">
        Signing out of seller dashboard...
      </h2>
      <p className="text-xs text-slate-400">Please wait a moment.</p>
    </div>
  );
}
