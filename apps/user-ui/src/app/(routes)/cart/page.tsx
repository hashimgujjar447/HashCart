'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useUser from '@/hooks/useUser';
import { useStore } from '@/store';
import { useLocationTracking } from '@/hooks/useLocation';
import { useDeviceTracking } from '@/hooks/useDevice';
import { X, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';

const CartPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const cart = useStore((state: any) => state.cart) || [];
  const removeFromCart = useStore((state: any) => state.removeFromCart);
  const updateCartQuantity = useStore((state: any) => state.updateCartQuantity);

  const [discountedProductId, setDiscountedProductId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [selectedAddress, setSelectedAddress] = useState(
    'Home - New York - USA',
  );
  const [paymentMethod, setPaymentMethod] = useState('Online Payment');
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce(
    (total: number, item: any) =>
      total + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0,
  );

  const total = Math.max(0, subtotal - discountAmount);

  const handleRemove = (id: string) => {
    removeFromCart(id, user, location, deviceInfo);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      setCouponMessage({
        type: 'error',
        text: 'Please enter a coupon code',
      });
      return;
    }

    if (
      couponCode.toUpperCase() === 'DISCOUNT10' ||
      couponCode.toUpperCase() === 'WELCOME'
    ) {
      const discount = subtotal * 0.1;
      setDiscountAmount(discount);
      setDiscountedProductId(couponCode.toUpperCase());
      setCouponMessage({
        type: 'success',
        text: '10% discount applied!',
      });
    } else {
      setCouponMessage({
        type: 'error',
        text: 'Invalid coupon code',
      });
    }
  };

  const handleCheckout = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/checkout');
    }, 600);
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-10">
      <div className="w-[88%] max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Shopping Cart
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1.5">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span>.</span>
            <span className="text-gray-800 font-medium">Cart</span>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-xs">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <ShoppingBag size={36} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Your Cart is Empty
            </h2>
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow hover:shadow-md cursor-pointer"
            >
              <span>Continue Shopping</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="hidden md:grid grid-cols-12 bg-gray-50 py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100">
                <div className="col-span-5">Product</div>
                <div className="col-span-3 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-center"></div>
              </div>

              <div className="divide-y divide-gray-100">
                {cart.map((item: any) => {
                  const qty = Number(item.quantity) || 1;

                  return (
                    <div
                      key={item.id}
                      className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="col-span-5 flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-lg p-2 flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden">
                          <img
                            src={item.image || '/placeholder-product.png'}
                            alt={item.title}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <Link
                          href={`/product/${item.slug || item.id}`}
                          className="font-medium text-sm text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                        >
                          {item.title}
                        </Link>
                      </div>

                      <div className="col-span-3 md:text-center flex md:block items-center justify-between">
                        <span className="text-xs text-gray-400 md:hidden">
                          Price:
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          ${Number(item.price || 0).toFixed(2)}
                        </span>
                      </div>

                      <div className="col-span-2 flex md:justify-center items-center justify-between">
                        <span className="text-xs text-gray-400 md:hidden">
                          Quantity:
                        </span>
                        <div className="inline-flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden shadow-xs">
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQuantity(item.id, 'decrease')
                            }
                            className="p-1.5 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-3 text-xs font-semibold text-gray-800">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQuantity(item.id, 'increase')
                            }
                            className="p-1.5 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="col-span-2 flex items-center justify-end md:justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors cursor-pointer p-1"
                        >
                          <X size={14} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
              <div className="flex items-center justify-between pb-5 border-b border-gray-100">
                <span className="text-base font-bold text-gray-900">
                  Subtotal
                </span>
                <span className="text-base font-bold text-gray-900">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between py-2.5 text-xs text-emerald-600 font-semibold border-b border-gray-100">
                  <span className="inline-flex items-center gap-1">
                    <Tag size={12} />
                    <span>Coupon ({discountedProductId})</span>
                  </span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="mt-5">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Have a Coupon?
                </label>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-blue-600 transition-all"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    Apply
                  </button>
                </form>
                {couponMessage && (
                  <p
                    className={`text-xs mt-1.5 ${
                      couponMessage.type === 'success'
                        ? 'text-emerald-600'
                        : 'text-red-500'
                    }`}
                  >
                    {couponMessage.text}
                  </p>
                )}
              </div>

              <div className="mt-5">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Select Shipping Address
                </label>
                <select
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 bg-white outline-none focus:border-blue-600 transition-all cursor-pointer"
                >
                  <option value="Home - New York - USA">
                    Home - New York - USA
                  </option>
                  <option value="Office - San Francisco - USA">
                    Office - San Francisco - USA
                  </option>
                  <option value="Other - Dhaka - Bangladesh">
                    Other - Dhaka - Bangladesh
                  </option>
                </select>
              </div>

              <div className="mt-5">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Select Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 bg-white outline-none focus:border-blue-600 transition-all cursor-pointer"
                >
                  <option value="Online Payment">Online Payment</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                </select>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                  <span className="text-sm font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">
                    ${total.toFixed(2)}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-all shadow hover:shadow-md cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                <span>{loading ? 'Processing...' : 'Proceed to Checkout'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;