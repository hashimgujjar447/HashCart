'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface DeviceUsageItem {
  name: string;
  value: number;
  color: string;
}

interface DeviceUsageChartProps {
  data?: DeviceUsageItem[];
  isLoading?: boolean;
}

const defaultDeviceData: DeviceUsageItem[] = [
  { name: 'Phone', value: 50, color: '#22c55e' },
  { name: 'Tablet', value: 20, color: '#f59e0b' },
  { name: 'Computer', value: 30, color: '#3b82f6' },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0f172a]/95 backdrop-blur-md border border-slate-700/60 rounded-xl px-3.5 py-2 shadow-2xl">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span className="text-xs font-semibold text-white">{data.name}</span>
        </div>
        <p className="text-sm font-bold text-slate-200 mt-0.5">
          {data.value}% of traffic
        </p>
      </div>
    );
  }
  return null;
};

export const DeviceUsageChart: React.FC<DeviceUsageChartProps> = ({
  data = defaultDeviceData,
  isLoading = false,
}) => {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = data && data.length > 0 ? data : defaultDeviceData;

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b from-[#080c14] to-[#04060a] border border-slate-800/60 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="mb-2 z-10">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Device Usage
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-normal">
          How visitors visit your shop
        </p>
      </div>

      {/* Donut Chart */}
      <div className="relative w-full h-[200px] flex items-center justify-center z-10">
        {isLoading || !mounted ? (
          <div className="w-32 h-32 rounded-full border-4 border-slate-800 animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={86}
                paddingAngle={4}
                cornerRadius={6}
                stroke="#04060a"
                strokeWidth={3}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                    style={{
                      filter:
                        activeIndex === index
                          ? `drop-shadow(0 0 10px ${entry.color}88)`
                          : 'none',
                      transform:
                        activeIndex === index ? 'scale(1.04)' : 'scale(1)',
                      transformOrigin: 'center center',
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}

        {/* Center Badge */}
        {mounted && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">
              Total
            </span>
            <span className="text-lg font-bold text-white">100%</span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-2 pt-3 border-t border-slate-800/60 z-10">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer group"
          >
            <span
              className="w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-125"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-medium text-slate-300">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeviceUsageChart;
