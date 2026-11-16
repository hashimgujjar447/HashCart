'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Store,
  MapPin,
  CreditCard,
  Printer,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';
import OrderTrackingStepper from './order-tracking-stepper';
import OrderReceiptModal from './order-receipt-modal';

interface OrdersTabProps {
  onStatsLoaded?: (stats: any) => void;
}

type FilterStatus = 'ALL' | 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

const OrdersTab: React.FC<OrdersTabProps> = ({ onStatsLoaded }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cancel Order Modal State
  const [cancelModalOrder, setCancelModalOrder] = useState<any | null>(null);
  const [cancelling, setCancelling] = useState<boolean>(false);

  // Receipt Modal State
  const [receiptOrder, setReceiptOrder] = useState<any | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let res;
      try {
        res = await axiosInstance.get('/order/get-user-orders');
      } catch {
        res = await axiosInstance.get('/auth/get-user-orders');
      }
      const fetchedOrders = res.data?.orders || [];
      setOrders(fetchedOrders);
      if (onStatsLoaded && res.data?.stats) {
        onStatsLoaded(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load user orders', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  // Handle Cancel Order
  const handleConfirmCancel = async () => {
    if (!cancelModalOrder) return;
    setCancelling(true);
    try {
      await axiosInstance.put(`/order/cancel-order/${cancelModalOrder.id}`);
      showToast('success', `Order #${cancelModalOrder.id.slice(-8).toUpperCase()} has been cancelled.`);
      setCancelModalOrder(null);
      // Refresh orders list
      fetchOrders();
    } catch (err: any) {
      console.error('Error cancelling order', err);
      showToast(
        'error',
        err.response?.data?.message || 'Failed to cancel order. Please try again.'
      );
    } finally {
      setCancelling(false);
    }
  };

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status Filter
      if (filterStatus !== 'ALL') {
        const orderStatus = order.status?.toLowerCase();
        const targetStatus = filterStatus.toLowerCase();
        if (targetStatus === 'delivered' && (orderStatus === 'delivered' || orderStatus === 'completed')) {
          // match delivered / completed
        } else if (orderStatus !== targetStatus) {
          return false;
        }
      }

      // Search Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const idMatch = order.id?.toLowerCase().includes(query);
        const shopMatch = order.shop?.name?.toLowerCase().includes(query);
        const itemMatch = Array.isArray(order.items) && order.items.some((item: any) =>
          item.title?.toLowerCase().includes(query)
        );
        return idMatch || shopMatch || itemMatch;
      }

      return true;
    });
  }, [orders, filterStatus, searchQuery]);

  // Counts for status tabs
  const statusCounts = useMemo(() => {
    return {
      ALL: orders.length,
      Pending: orders.filter((o) => o.status?.toLowerCase() === 'pending').length,
      Processing: orders.filter((o) => o.status?.toLowerCase() === 'processing').length,
      Shipped: orders.filter((o) => o.status?.toLowerCase() === 'shipped').length,
      Delivered: orders.filter((o) => ['delivered', 'completed'].includes(o.status?.toLowerCase())).length,
      Cancelled: orders.filter((o) => o.status?.toLowerCase() === 'cancelled').length,
    };
  }, [orders]);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} className="stroke-[2.5]" />
            Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Truck size={13} className="stroke-[2.5]" />
            Shipped
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock size={13} className="stroke-[2.5]" />
            Processing
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <XCircle size={13} className="stroke-[2.5]" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Package size={13} className="stroke-[2.5]" />
            Pending
          </span>
        );
    }
  };

  return (
    <div>
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`mb-5 p-4 rounded-xl flex items-center justify-between gap-3 text-xs font-semibold shadow-xs transition-all animate-in fade-in ${
            toast.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-700">
            <XCircle size={15} />
          </button>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            My Orders
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Track order status in real-time, view invoice receipts, and review item details.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {(['ALL', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as FilterStatus[]).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/70 hover:text-gray-900'
                }`}
              >
                <span>{status === 'ALL' ? 'All Orders' : status}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    filterStatus === status ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {statusCounts[status]}
                </span>
              </button>
            )
          )}
        </div>

        {/* Live Search */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search by Order # or item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 border border-gray-200 rounded-2xl bg-white animate-pulse space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-2 w-1/3">
                  <div className="w-28 h-4 bg-gray-200 rounded" />
                  <div className="w-20 h-3 bg-gray-100 rounded" />
                </div>
                <div className="w-24 h-7 bg-gray-200 rounded-full" />
              </div>
              <div className="h-2 bg-gray-100 rounded-full w-full" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const items = Array.isArray(order.items) ? order.items : [];
            const address = order.shippingAddress || {};
            const isPending = order.status?.toLowerCase() === 'pending';

            return (
              <div
                key={order.id}
                className={`border rounded-2xl bg-white transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'border-blue-300 shadow-md ring-2 ring-blue-50'
                    : 'border-gray-200/90 hover:border-gray-300 shadow-xs'
                }`}
              >
                {/* Clickable Card Header */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="p-5 cursor-pointer hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
                >
                  {/* Left info: Order ID, Date & Vendor */}
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-sm font-extrabold text-gray-900 tracking-tight">
                        Order #{order.id?.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-500 font-medium">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Recently'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
                      {order.shop?.name && (
                        <span className="inline-flex items-center gap-1 text-gray-700 font-semibold bg-gray-100 px-2 py-0.5 rounded-md">
                          <Store size={12} className="text-blue-600" />
                          <span>{order.shop.name}</span>
                        </span>
                      )}
                      <span>
                        {items.length} {items.length === 1 ? 'item' : 'items'}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span>
                        Payment:{' '}
                        <span className="font-semibold text-gray-800 capitalize">
                          {order.paymentMethod === 'card' ? 'Card (Stripe)' : 'Cash on Delivery'}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Right info: Total price, Status badge & Chevron toggle */}
                  <div className="flex items-center justify-between md:justify-end gap-5 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <div className="text-left md:text-right">
                      <span className="text-xs text-gray-400 block font-medium">Total</span>
                      <span className="text-base font-extrabold text-gray-900 block tracking-tight">
                        ${Number(order.totalAmount || 0).toFixed(2)}
                      </span>
                    </div>

                    <div>{getStatusBadge(order.status)}</div>

                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center shrink-0 transition-transform duration-200">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Tracking & Details Container */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/40 p-5 sm:p-6 animate-in slide-in-from-top-2 duration-300">
                    {/* 1. Live Order Progress Stepper with animated Blue line */}
                    <div className="mb-6">
                      <OrderTrackingStepper
                        status={order.status}
                        createdAt={order.createdAt}
                        updatedAt={order.updatedAt}
                      />
                    </div>

                    {/* 2. Items in Order */}
                    <div className="mb-6">
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                        Package Items ({items.length})
                      </h4>
                      <div className="space-y-2.5">
                        {items.map((item: any, idx: number) => {
                          const price = Number(item.sale_price ?? item.price ?? 0);
                          const qty = Number(item.quantity ?? 1);
                          const imgUrl = item.image || item.images?.[0]?.url || '';

                          return (
                            <div
                              key={idx}
                              className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-4 shadow-2xs hover:border-gray-300 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {imgUrl ? (
                                  <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden relative shrink-0">
                                    <Image
                                      src={imgUrl}
                                      alt={item.title || 'Product'}
                                      fill
                                      className="object-cover"
                                      sizes="56px"
                                      unoptimized
                                    />
                                  </div>
                                ) : (
                                  <div className="w-14 h-14 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                    <Package size={24} />
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <Link
                                    href={item.productId ? `/product/${item.productId}` : '/products'}
                                    className="text-xs sm:text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1 block"
                                  >
                                    {item.title || 'Product Item'}
                                  </Link>
                                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                                    <span>
                                      ${price.toFixed(2)} × {qty}
                                    </span>
                                    {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                      <>
                                        <span>•</span>
                                        <span className="text-[11px] text-gray-400">
                                          {Object.entries(item.selectedOptions)
                                            .map(([k, v]) => `${k}: ${v}`)
                                            .join(', ')}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-sm font-extrabold text-gray-900 block">
                                  ${(price * qty).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. Delivery & Cost Breakdown Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {/* Shipping Address */}
                      <div className="bg-white border border-gray-200 rounded-xl p-4 text-xs shadow-2xs">
                        <div className="flex items-center gap-1.5 font-bold text-gray-800 mb-2">
                          <MapPin size={15} className="text-blue-600" />
                          <span>Delivery Address</span>
                        </div>
                        <p className="font-bold text-gray-900 text-sm">
                          {address.name || 'Recipient'}
                        </p>
                        <p className="text-gray-600 mt-1">
                          {address.street || address.address || 'Standard Address'}
                        </p>
                        <p className="text-gray-600">
                          {address.city ? `${address.city}, ` : ''}
                          {address.zipCode ? `${address.zipCode}, ` : ''}
                          {address.country || ''}
                        </p>
                        {address.phone && (
                          <p className="text-gray-500 mt-1 font-mono">
                            Tel: {address.phone}
                          </p>
                        )}
                      </div>

                      {/* Payment & Summary */}
                      <div className="bg-white border border-gray-200 rounded-xl p-4 text-xs shadow-2xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-gray-800 mb-2">
                            <CreditCard size={15} className="text-blue-600" />
                            <span>Payment & Total Breakdown</span>
                          </div>
                          <div className="space-y-1.5 text-gray-600">
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span className="font-semibold text-gray-900">
                                ${Number(order.totalAmount || 0).toFixed(2)}
                              </span>
                            </div>
                            {order.discountAmount > 0 && (
                              <div className="flex justify-between text-emerald-600">
                                <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}:</span>
                                <span className="font-semibold">
                                  -${Number(order.discountAmount).toFixed(2)}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>Shipping:</span>
                              <span className="font-semibold text-gray-900">
                                {order.deliveryFee > 0 ? `$${Number(order.deliveryFee).toFixed(2)}` : 'Free Delivery'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100 mt-3 flex items-center justify-between">
                          <span className="font-bold text-gray-900 text-sm">Grand Total:</span>
                          <span className="text-base font-extrabold text-blue-600">
                            ${Number(order.totalAmount || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 4. Action Buttons Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        {/* Printable Receipt Modal Trigger */}
                        <button
                          onClick={() => setReceiptOrder(order)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-800 font-semibold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
                        >
                          <Printer size={14} className="text-blue-600" />
                          <span>View Invoice / Print Receipt</span>
                        </button>

                        {/* Contact Seller link */}
                        {order.shop?.id && (
                          <Link
                            href={`/shop/${order.shop.id}`}
                            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-xl transition-colors"
                          >
                            <Store size={13} />
                            <span>Visit Shop</span>
                          </Link>
                        )}
                      </div>

                      {/* Cancel Order Button (Only allowed if order is Pending) */}
                      {isPending && (
                        <button
                          onClick={() => setCancelModalOrder(order)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          <XCircle size={14} />
                          <span>Cancel Order</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-14 px-4 border border-dashed border-gray-200 rounded-2xl bg-white">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Package size={26} />
          </div>
          <h3 className="text-base font-extrabold text-gray-900 mb-1">
            {searchQuery || filterStatus !== 'ALL'
              ? 'No matching orders found'
              : 'No Orders Placed Yet'}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
            {searchQuery || filterStatus !== 'ALL'
              ? 'Try adjusting your status filter or clearing the search keyword.'
              : "You haven't placed any orders yet. Discover trending deals and shop from verified sellers today."}
          </p>
          {searchQuery || filterStatus !== 'ALL' ? (
            <button
              onClick={() => {
                setFilterStatus('ALL');
                setSearchQuery('');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              <span>Reset Filters</span>
            </button>
          ) : (
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <span>Explore Products</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Cancel Order #{cancelModalOrder.id?.slice(-8).toUpperCase()}?
            </h3>
            <p className="text-xs text-gray-600 mb-5 leading-relaxed">
              Are you sure you want to cancel this order? This action cannot be reversed, and any reserved items will immediately be returned to seller inventory.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                disabled={cancelling}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                {cancelling ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Yes, Cancel Order</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {receiptOrder && (
        <OrderReceiptModal
          order={receiptOrder}
          isOpen={Boolean(receiptOrder)}
          onClose={() => setReceiptOrder(null)}
        />
      )}
    </div>
  );
};

export default OrdersTab;
