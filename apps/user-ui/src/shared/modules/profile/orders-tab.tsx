'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';

interface OrdersTabProps {
  onStatsLoaded?: (stats: any) => void;
}

const OrdersTab: React.FC<OrdersTabProps> = ({ onStatsLoaded }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/auth/get-user-orders');
        setOrders(res.data.orders || []);
        if (onStatsLoaded && res.data.stats) {
          onStatsLoaded(res.data.stats);
        }
      } catch (err) {
        console.error('Failed to load user orders', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
            <CheckCircle2 size={12} />
            Completed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock size={12} />
            Processing
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <AlertCircle size={12} />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {status || 'Pending'}
          </span>
        );
    }
  };

  return (
    <div>
      <div className="pb-5 border-b border-gray-100 mb-6">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          My Orders
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Track, view, and manage all your past and active orders.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 border border-gray-200 rounded-xl bg-white animate-pulse flex items-center justify-between"
            >
              <div className="space-y-2 w-1/3">
                <div className="w-24 h-4 bg-gray-200 rounded" />
                <div className="w-16 h-3 bg-gray-200 rounded" />
              </div>
              <div className="w-20 h-6 bg-gray-200 rounded-full" />
              <div className="w-16 h-4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-4 border border-gray-200 rounded-xl bg-white hover:border-gray-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-900">
                    Order #{order.id?.slice(-8).toUpperCase()}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Recently'}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  {Array.isArray(order.items) ? `${order.items.length} items` : '1 package'}
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-5">
                <div>{getStatusBadge(order.status)}</div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-900 block">
                    ${order.totalAmount || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 border border-dashed border-gray-200 rounded-xl bg-white">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Package size={22} />
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">
            No Orders Placed Yet
          </h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto mb-4">
            You haven't placed any orders yet. Browse our products and discover great deals.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
          >
            <span>Explore Products</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
