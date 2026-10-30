'use client';

import React from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react';

interface StatsOverviewProps {
  stats?: {
    totalRevenue: number;
    totalOrders: number;
    processingOrders: number;
    deliveredOrders: number;
  };
  isLoading?: boolean;
}

export const StatOverview: React.FC<StatsOverviewProps> = ({
  stats,
  isLoading = false,
}) => {
  const cards = [
    {
      title: 'Total Revenue',
      value: stats ? `$${stats.totalRevenue.toLocaleString()}` : '$2,850',
      change: '+18.2% from last month',
      icon: <DollarSign className="w-5 h-5 text-blue-400" />,
      accent: 'border-blue-500/20 bg-blue-500/5',
    },
    {
      title: 'Total Orders',
      value: stats ? stats.totalOrders.toString() : '6',
      change: '+12% from last month',
      icon: <ShoppingCart className="w-5 h-5 text-emerald-400" />,
      accent: 'border-emerald-500/20 bg-emerald-500/5',
    },
    {
      title: 'Delivered',
      value: stats ? stats.deliveredOrders.toString() : '2',
      change: '100% fulfillment rate',
      icon: <TrendingUp className="w-5 h-5 text-amber-400" />,
      accent: 'border-amber-500/20 bg-amber-500/5',
    },
    {
      title: 'Active Store Visitors',
      value: '2,980',
      change: '+28.4% online now',
      icon: <Users className="w-5 h-5 text-purple-400" />,
      accent: 'border-purple-500/20 bg-purple-500/5',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((c, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-gradient-to-b from-[#080c14] to-[#04060a] border border-slate-800/60 shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {c.title}
            </span>
            <div className={`p-2.5 rounded-xl border ${c.accent}`}>
              {c.icon}
            </div>
          </div>

          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {c.value}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">{c.change}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatOverview;
