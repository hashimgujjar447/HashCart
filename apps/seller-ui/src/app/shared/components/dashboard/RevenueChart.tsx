'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface RevenueDataPoint {
  month: string;
  revenue: number;
  ordersCount?: number;
}

interface RevenueChartProps {
  data?: RevenueDataPoint[];
  isLoading?: boolean;
}

const defaultRevenueData: RevenueDataPoint[] = [
  { month: 'Jan', revenue: 140 },
  { month: 'Feb', revenue: 260 },
  { month: 'Mar', revenue: 210 },
  { month: 'Apr', revenue: 480 },
  { month: 'May', revenue: 390 },
  { month: 'Jun', revenue: 1120 },
  { month: 'Jul', revenue: 980 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-[#0f172a]/95 backdrop-blur-md border border-blue-500/30 rounded-xl px-4 py-2.5 shadow-2xl shadow-blue-500/10">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-lg font-bold text-white tracking-tight mt-0.5">
          ${Number(val).toLocaleString()}
        </p>
        {payload[0].payload.ordersCount !== undefined && (
          <p className="text-[11px] text-blue-400 mt-0.5">
            {payload[0].payload.ordersCount} orders placed
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data = defaultRevenueData,
  isLoading = false,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = data && data.length > 0 ? data : defaultRevenueData;


  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b from-[#080c14] to-[#04060a] border border-slate-800/60 shadow-xl overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 left-1/4 w-48 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 z-10">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Revenue
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-normal">
            Last 6 months performance
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+24.5%</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-[260px] relative z-10">
        {isLoading || !mounted ? (
          <div className="w-full h-full flex items-center justify-center animate-pulse">
            <div className="w-full h-40 bg-slate-800/30 rounded-xl" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.45} />
                  <stop offset="60%" stopColor="#3b82f6" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                dy={10}
              />
              <YAxis hide={true} domain={['dataMin - 50', 'dataMax + 100']} />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: '#3b82f6',
                  strokeWidth: 1,
                  strokeDasharray: '4 4',
                }}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#revenueGlow)"
                dot={false}
                activeDot={{
                  r: 6,
                  fill: '#3b82f6',
                  stroke: '#ffffff',
                  strokeWidth: 2.5,
                  filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))',
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default RevenueChart;
