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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      queryClient.invalidateQueries({
        queryKey: ['seller-dashboard-analytics'],
      });
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

      {/* Quick Status Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { label: 'All Orders', value: 'ALL', count: stats.totalOrders },
          {
            label: 'Processing',
            value: 'Processing',
            count: stats.processingOrders,
          },
          { label: 'Shipped', value: 'Shipped', count: null },
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
                        <select
                          value={order.status}
                          disabled={
                            updateStatusMutation.isPending ||
                            order.status === 'Cancelled'
                          }
                          onChange={(e) =>
                            updateStatusMutation.mutate({
                              id: order.id,
                              status: e.target.value,
                            })
                          }
                          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer disabled:opacity-50"
                        >
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
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
