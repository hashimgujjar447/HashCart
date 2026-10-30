'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus, RefreshCw } from 'lucide-react';
import axiosInstance from '@/app/utils/axiosInstance';
import { useSeller } from '@/app/hooks/useSeller';
import RevenueChart from '@/app/shared/components/dashboard/RevenueChart';
import DeviceUsageChart from '@/app/shared/components/dashboard/DeviceUsageChart';
import VisitorsDistributionMap from '@/app/shared/components/dashboard/VisitorsDistributionMap';
import RecentOrdersTable from '@/app/shared/components/dashboard/RecentOrdersTable';
import StatOverview from '@/app/shared/components/dashboard/StatOverview';

const fetchDashboardAnalytics = async () => {
  try {
    const res = await axiosInstance.get('/order/get-seller-analytics', {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    console.warn('Direct analytics endpoint unavailable, falling back:', err);
    // Fallback: try get-seller-orders
    try {
      const ordersRes = await axiosInstance.get('/order/get-seller-orders', {
        withCredentials: true,
      });
      return {
        success: true,
        stats: ordersRes.data.stats,
        recentOrders: ordersRes.data.orders?.slice(0, 6) || [],
      };
    } catch {
      return null;
    }
  }
};

const DashboardPage = () => {
  const { seller } = useSeller();

  const {
    data: analytics,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['seller-dashboard-analytics'],
    queryFn: fetchDashboardAnalytics,
    refetchInterval: 30000, // Live poll every 30s
    staleTime: 10000,
  });

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 pb-12 select-none">
      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Dashboard Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              Live
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Welcome back,{' '}
            <span className="text-slate-200 font-semibold">
              {seller?.name || seller?.shop?.name || 'Seller'}
            </span>
            ! Here is your shop's performance snapshot.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition-all hover:text-white"
            title="Refresh statistics"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            href="/dashboard/create-product"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Top High-level Metric Stat Cards */}
      <StatOverview stats={analytics?.stats} isLoading={isLoading} />

      {/* Main 2x2 Analytics Layout Grid (Exact Match to User Reference) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ROW 1: LEFT - Revenue Area Spline Chart (7 columns) */}
        <div className="lg:col-span-7 xl:col-span-8 min-h-[360px]">
          <RevenueChart
            data={analytics?.revenuePerformance}
            isLoading={isLoading}
          />
        </div>

        {/* ROW 1: RIGHT - Device Usage Donut Chart (5 columns) */}
        <div className="lg:col-span-5 xl:col-span-4 min-h-[360px]">
          <DeviceUsageChart
            data={analytics?.deviceUsage}
            isLoading={isLoading}
          />
        </div>

        {/* ROW 2: LEFT - Visitors Distribution World Map (6 columns) */}
        <div className="lg:col-span-6 min-h-[380px]">
          <VisitorsDistributionMap
            data={analytics?.visitorsDistribution}
            isLoading={isLoading}
          />
        </div>

        {/* ROW 2: RIGHT - Recent Orders Table (6 columns) */}
        <div className="lg:col-span-6 min-h-[380px]">
          <RecentOrdersTable
            orders={analytics?.recentOrders}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
