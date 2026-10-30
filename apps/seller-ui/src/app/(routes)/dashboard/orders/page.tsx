'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import axiosInstance from '@/app/utils/axiosInstance';

interface OrderItem {
  id: string;
  title?: string;
  name?: string;
  price: number;
  quantity: number;
  image?: string;
}

interface SellerOrder {
  id: string;
  totalAmount: number;
  status:
    | 'Pending'
    | 'Processing'
    | 'Shipped'
    | 'Delivered'
    | 'Completed'
    | 'Cancelled'
    | 'Refunded';
  paymentStatus: string;
  paymentMethod: string;
  items: OrderItem[];
  shippingAddress: any;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone_number?: string;
  };
}

// Strict forward order lifecycle transitions
export const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  Pending: ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered', 'Cancelled'],
  Delivered: [],
  Completed: [],
  Cancelled: [],
  Refunded: [],
};

const fetchSellerOrders = async () => {
  const res = await axiosInstance.get('/order/get-seller-orders', {
    withCredentials: true,
  });
  return res.data;
};

export default function SellerOrdersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: fetchSellerOrders,
    refetchInterval: 30000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await axiosInstance.put(
        `/order/update-order-status/${id}`,
        { status },
        { withCredentials: true },
      );
      return res.data;
    },
    onSuccess: (resData) => {
      setFeedback({
        type: 'success',
        text: resData.message || 'Order status updated successfully',
      });
      setTimeout(() => setFeedback(null), 4000);
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      queryClient.invalidateQueries({
        queryKey: ['seller-dashboard-analytics'],
      });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update order status';
      setFeedback({ type: 'error', text: msg });
      setTimeout(() => setFeedback(null), 5000);
    },
  });

  const rawOrders: SellerOrder[] = data?.orders || [];
  const stats = data?.stats || {
    totalOrders: rawOrders.length,
    processingOrders: rawOrders.filter((o) => o.status === 'Processing').length,
    deliveredOrders: rawOrders.filter((o) => o.status === 'Delivered').length,
    cancelledOrders: rawOrders.filter((o) => o.status === 'Cancelled').length,
  };

  const filteredOrders = rawOrders.filter((order) => {
    const matchesStatus =
      statusFilter === 'ALL' ? true : order.status === statusFilter;
    const customerName = order.user?.name || order.shippingAddress?.name || '';
    const orderId = order.id || '';
    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orderId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
      case 'Completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{status}</span>
          </span>
        );
      case 'Shipped':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center gap-1.5 w-fit">
            <Truck className="w-3.5 h-3.5" />
            <span>{status}</span>
          </span>
        );
      case 'Processing':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-1.5 w-fit">
            <Clock className="w-3.5 h-3.5" />
            <span>Processing</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center gap-1.5 w-fit">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
          </span>
        );
      case 'Cancelled':
      case 'Refunded':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-1.5 w-fit">
            <XCircle className="w-3.5 h-3.5" />
            <span>{status}</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300 w-fit">
            {status}
          </span>
        );
    }
  };


  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Orders Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track, fulfill, and manage your shop transactions.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition-all w-fit"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`}
          />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Action Notification Toast/Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-600/70 text-emerald-200'
              : 'bg-rose-950/60 border-rose-600/70 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Quick Status Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { label: 'All Orders', value: 'ALL', count: stats.totalOrders },
          {
            label: 'Pending',
            value: 'Pending',
            count: rawOrders.filter((o) => o.status === 'Pending').length,
          },
          {
            label: 'Processing',
            value: 'Processing',
            count: stats.processingOrders,
          },
          {
            label: 'Shipped',
            value: 'Shipped',
            count: rawOrders.filter((o) => o.status === 'Shipped').length,
          },
          {
            label: 'Delivered',
            value: 'Delivered',
            count: stats.deliveredOrders,
          },
          {
            label: 'Cancelled',
            value: 'Cancelled',
            count: stats.cancelledOrders,
          },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              statusFilter === f.value
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>{f.label}</span>

            {f.count !== null && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  statusFilter === f.value
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by customer name or order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#080c14] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Orders Table */}
      <div className="w-full rounded-2xl bg-gradient-to-b from-[#080c14] to-[#04060a] border border-slate-800/80 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/90 bg-[#090d16] text-[12px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/50 text-sm">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="py-4 px-4">
                      <div className="h-5 bg-slate-800/50 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ShoppingBag className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                    <p className="text-sm font-medium">No orders found.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => {
                  const customerName =
                    order.user?.name ||
                    order.shippingAddress?.name ||
                    'Customer';
                  const dateStr = new Date(
                    order.createdAt,
                  ).toLocaleDateString();

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-xs text-blue-400 font-medium">
                        #{order.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4 text-slate-200 font-medium text-xs">
                        {customerName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-xs">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 text-xs">
                        {order.items?.length || 1} items
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white text-xs">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {(() => {
                          const allowedNext =
                            ALLOWED_STATUS_TRANSITIONS[order.status] || [];
                          const isTerminal = allowedNext.length === 0;

                          if (isTerminal) {
                            return (
                              <span className="text-xs text-slate-500 italic px-2 py-1 select-none">
                                {order.status === 'Cancelled'
                                  ? 'Cancelled'
                                  : 'Completed'}
                              </span>
                            );
                          }

                          return (
                            <select
                              value={order.status}
                              disabled={updateStatusMutation.isPending}
                              onChange={(e) => {
                                const newStatus = e.target.value;
                                if (newStatus === order.status) return;

                                if (
                                  newStatus === 'Cancelled' &&
                                  !window.confirm(
                                    `Are you sure you want to cancel order #${order.id
                                      .slice(-6)
                                      .toUpperCase()}? This will restore product stock.`,
                                  )
                                ) {
                                  return;
                                }

                                updateStatusMutation.mutate({
                                  id: order.id,
                                  status: newStatus,
                                });
                              }}
                              className="bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer disabled:opacity-50 transition-colors"
                            >
                              <option value={order.status} disabled>
                                {order.status} (Current)
                              </option>
                              {allowedNext.map((nextStatus) => (
                                <option key={nextStatus} value={nextStatus}>
                                  {nextStatus === 'Cancelled'
                                    ? '✕ Cancel Order'
                                    : `→ Move to ${nextStatus}`}
                                </option>
                              ))}
                            </select>
                          );
                        })()}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
