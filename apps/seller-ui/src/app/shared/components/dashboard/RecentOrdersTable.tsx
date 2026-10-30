'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Zap } from 'lucide-react';

export interface RecentOrderItem {
  id: string;
  orderId: string;
  code?: string;
  customer: string;
  customerEmail?: string;
  amount: number;
  amountFormatted?: string;
  status: 'Paid' | 'Pending' | 'Failed';
  rawStatus?: string;
  date?: string | Date;
}

interface RecentOrdersTableProps {
  orders?: RecentOrderItem[];
  isLoading?: boolean;
}

const defaultOrders: RecentOrderItem[] = [
  {
    id: '1',
    orderId: 'ORD-001',
    customer: 'John Doe',
    amount: 250,
    amountFormatted: '$250',
    status: 'Paid',
  },
  {
    id: '2',
    orderId: 'ORD-002',
    customer: 'Jane Smith',
    amount: 180,
    amountFormatted: '$180',
    status: 'Pending',
  },
  {
    id: '3',
    orderId: 'ORD-003',
    customer: 'Alice Johnson',
    amount: 340,
    amountFormatted: '$340',
    status: 'Paid',
  },
  {
    id: '4',
    orderId: 'ORD-004',
    customer: 'Bob Lee',
    amount: 90,
    amountFormatted: '$90',
    status: 'Failed',
  },
  {
    id: '5',
    orderId: 'ORD-005',
    customer: 'Bob Lee',
    amount: 90,
    amountFormatted: '$90',
    status: 'Failed',
  },
  {
    id: '6',
    orderId: 'ORD-006',
    customer: 'Bob Lee',
    amount: 90,
    amountFormatted: '$90',
    status: 'Failed',
  },
];

export const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({
  orders = defaultOrders,
  isLoading = false,
}) => {
  const displayOrders = orders && orders.length > 0 ? orders : defaultOrders;

  const getStatusColor = (status: 'Paid' | 'Pending' | 'Failed') => {
    switch (status) {
      case 'Paid':
        return 'text-emerald-400 font-medium';
      case 'Pending':
        return 'text-amber-400 font-medium';
      case 'Failed':
        return 'text-rose-500 font-medium';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b from-[#080c14] to-[#04060a] border border-slate-800/60 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 z-10">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Recent Orders
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-normal">
            A quick snapshot of your latest transactions.
          </p>
        </div>

        <Link
          href="/dashboard/orders"
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          <span>View All</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table Container */}
      <div className="w-full flex-1 overflow-x-auto z-10">
        <div className="w-full border border-slate-800/80 rounded-xl overflow-hidden bg-[#0c121e]/70">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/90 bg-[#090d16]">
                <th className="py-3 px-4 text-[12px] font-semibold text-slate-400 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="py-3 px-4 text-[12px] font-semibold text-slate-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="py-3 px-4 text-[12px] font-semibold text-slate-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="py-3 px-4 text-[12px] font-semibold text-slate-400 uppercase tracking-wider text-right">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/50 text-sm">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 px-4">
                      <div className="h-4 w-16 bg-slate-800/60 rounded" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-4 w-28 bg-slate-800/60 rounded" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-4 w-14 bg-slate-800/60 rounded" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="h-4 w-12 bg-slate-800/60 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : (
                displayOrders.map((order, idx) => (
                  <tr
                    key={order.id || idx}
                    className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono text-[13px] text-slate-200 group-hover:text-blue-400 transition-colors">
                      {order.orderId || `ORD-00${idx + 1}`}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium text-[13px]">
                      {order.customer}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white text-[13px]">
                      {order.amountFormatted || `$${order.amount}`}
                    </td>
                    <td
                      className={`py-3 px-4 text-right text-[13px] ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Corner Electric Badge (Matching screenshot) */}
      <div className="absolute bottom-5 right-5 z-20 pointer-events-none">
        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.4)]">
          <Zap className="w-4 h-4 fill-emerald-400" />
        </div>
      </div>
    </div>
  );
};

export default RecentOrdersTable;
