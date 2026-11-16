'use client';

import React from 'react';
import { X, Printer, CheckCircle2, Clock } from 'lucide-react';

interface OrderReceiptModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  const items = Array.isArray(order.items) ? order.items : [];
  const address = order.shippingAddress || {};
  const isPaid =
    order.paymentStatus?.toLowerCase() === 'paid' ||
    order.paymentMethod?.toLowerCase() === 'card';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Top Header (Hidden in Print) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">
              Order Receipt & Invoice
            </span>
            <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
              #{order.id?.slice(-8).toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Printer size={14} />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="overflow-y-auto p-6 sm:p-8 font-poppins text-gray-800 print:p-0 print:m-0 print:overflow-visible">
          {/* Marketplace Branding & Receipt Header */}
          <div className="flex items-start justify-between border-b border-gray-200 pb-6 mb-6">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
                Hash<span className="text-blue-600">Cart</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Multi-Vendor E-Commerce Marketplace
              </p>
              <p className="text-xs text-gray-400 mt-1">support@hashcart.com</p>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                Official Invoice
              </span>
              <h3 className="text-base font-extrabold text-gray-900 mt-0.5">
                #{order.id?.slice(-8).toUpperCase()}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Date:{' '}
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </p>
              <div className="mt-2">
                {isPaid ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    <CheckCircle2 size={12} />
                    Paid
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    <Clock size={12} />
                    Cash on Delivery
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Billing & Shipping Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 text-xs">
            <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
              <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px] mb-1.5">
                Delivery Address:
              </p>
              <p className="font-bold text-gray-900 text-sm">
                {address.name || 'Customer'}
              </p>
              <p className="text-gray-600 mt-1">
                {address.street || address.address || 'Street Address'}
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

            <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
              <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px] mb-1.5">
                Vendor & Order Details:
              </p>
              <p className="font-bold text-gray-900 text-sm">
                Sold by: {order.shop?.name || 'Authorized Merchant'}
              </p>
              <p className="text-gray-600 mt-1">
                Payment Method:{' '}
                <span className="font-medium text-gray-800 capitalize">
                  {order.paymentMethod === 'card'
                    ? 'Credit / Debit Card'
                    : 'Cash on Delivery (COD)'}
                </span>
              </p>
              <p className="text-gray-600 mt-0.5">
                Status:{' '}
                <span className="font-bold text-blue-600">
                  {order.status || 'Pending'}
                </span>
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100/80 text-gray-600 uppercase text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Item Description</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.length > 0 ? (
                  items.map((item: any, idx: number) => {
                    const price = Number(item.sale_price ?? item.price ?? 0);
                    const qty = Number(item.quantity ?? 1);
                    return (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="py-3 px-4">
                          <p className="font-bold text-gray-900">
                            {item.title || item.name || 'Product Item'}
                          </p>
                          {item.selectedOptions && (
                            <p className="text-[11px] text-gray-500">
                              {Object.entries(item.selectedOptions)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(', ')}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-medium">
                          {qty}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          ${price.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-gray-900">
                          ${(price * qty).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 px-4 text-center text-gray-400">
                      Standard Package
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pricing Breakdown Summary */}
          <div className="flex justify-end mb-6">
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-gray-900">
                  ${Number(order.totalAmount || 0).toFixed(2)}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>
                    Discount {order.couponCode ? `(${order.couponCode})` : ''}:
                  </span>
                  <span className="font-semibold">
                    -${Number(order.discountAmount).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee:</span>
                <span className="font-semibold text-gray-900">
                  {order.deliveryFee > 0
                    ? `$${Number(order.deliveryFee).toFixed(2)}`
                    : 'Free Delivery'}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-extrabold text-gray-900">
                <span>Total Amount:</span>
                <span className="text-blue-600 text-base">
                  ${Number(order.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="border-t border-gray-100 pt-4 text-center text-[11px] text-gray-400">
            <p>
              Thank you for shopping on HashCart! For any order queries, please reach out with your Order ID.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReceiptModal;
