'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useUser from '@/hooks/useUser';
import { useStore } from '@/store';
import { useLocationTracking } from '@/hooks/useLocation';
import { useDeviceTracking } from '@/hooks/useDevice';
import axiosInstance from '@/utils/axiosInstance';
import AddAddressModal from '@/shared/components/modals/add-address-modal';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
  Lock,
  ExternalLink,
} from 'lucide-react';

interface AddressType {
  id: string;
  type: string;
  name: string;
  street: string;
  city: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

const CartPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const cart = useStore((state: any) => state.cart) || [];
  const removeFromCart = useStore((state: any) => state.removeFromCart);
  const updateCartQuantity = useStore((state: any) => state.updateCartQuantity);
  const clearCart = useStore((state: any) => state.clearCart);

  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: '4242 •••• •••• 4242',
    expDate: '12/28',
    cvc: '123',
    cardHolder: '',
  });
  const [activeSession, setActiveSession] = useState<{
    sessionId: string;
    paymentIntentId: string;
    amount: number;
  } | null>(null);

  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  useEffect(() => {
    if (user?.name && !cardData.cardHolder) {
      setCardData((prev) => ({ ...prev, cardHolder: user.name }));
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;
    setLoadingAddresses(true);
    try {
      const res = await axiosInstance.get('/auth/get-addresses');
      const addrs: AddressType[] = res.data.addresses || [];
      setAddresses(addrs);

      if (addrs.length > 0 && !selectedAddressId) {
        const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
        setSelectedAddressId(defaultAddr.id);
      }
    } catch (err) {
      console.warn('Failed to load user addresses', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

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

    const code = couponCode.trim().toUpperCase();
    if (code === 'DISCOUNT10' || code === 'WELCOME' || code === 'SAVE10') {
      const discount = Math.round(subtotal * 0.1 * 100) / 100;
      setDiscountAmount(discount);
      setCouponMessage({
        type: 'success',
        text: '10% promotional discount applied!',
      });
    } else {
      setCouponMessage({
        type: 'error',
        text: 'Invalid or expired coupon code',
      });
    }
  };

  const getSelectedAddressObj = () => {
    const found = addresses.find((a) => a.id === selectedAddressId);
    if (found) return found;
    if (addresses.length > 0) return addresses[0];
    return null;
  };

  const handlePlaceOrder = async () => {
    setErrorMsg(null);

    if (!user) {
      router.push('/login?redirect=/cart');
      return;
    }

    if (cart.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    const shippingAddress = getSelectedAddressObj();
    if (!shippingAddress) {
      setErrorMsg('Please select or add a shipping address.');
      setIsAddressModalOpen(true);
      return;
    }

    const activeCoupon = couponCode
      ? {
          code: couponCode.toUpperCase(),
          discountValue: discountAmount,
          discountType: 'percentage',
        }
      : null;

    if (paymentMethod === 'COD') {
      setLoading(true);
      try {
        const res = await axiosInstance.post('/order/create-direct-order', {
          cart,
          shippingAddress,
          coupon: activeCoupon,
          paymentMethod: 'COD',
        });

        if (res.data.success) {
          clearCart();
          const placedOrders = res.data.orders || [];
          setOrderSuccess({
            orders: placedOrders,
            total,
            method: 'Cash on Delivery',
            address: shippingAddress,
          });
        }
      } catch (err: any) {
        console.error('Failed to create order', err);
        setErrorMsg(
          err.response?.data?.message ||
            'Failed to place order. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const sessionRes = await axiosInstance.post(
          '/order/create-payment-session',
          {
            cart,
            selectedAddress: shippingAddress,
            coupon: activeCoupon,
          },
        );

        const { sessionId, totalAmount } = sessionRes.data;

        const intentRes = await axiosInstance.post(
          '/order/create-payment-intent',
          {
            amount: totalAmount || total,
            sessionId,
          },
        );

        const { paymentIntentId } = intentRes.data;

        setActiveSession({
          sessionId,
          paymentIntentId,
          amount: totalAmount || total,
        });

        setIsCardModalOpen(true);
      } catch (err: any) {
        console.error('Failed to initiate online checkout', err);
        setErrorMsg(
          err.response?.data?.message ||
            'Failed to initiate payment session. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleConfirmCardPayment = async () => {
    if (!activeSession) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await axiosInstance.post('/order/verify-payment', {
        sessionId: activeSession.sessionId,
        paymentIntentId: activeSession.paymentIntentId,
      });

      if (res.data.success) {
        clearCart();
        setIsCardModalOpen(false);
        const placedOrders = res.data.orders || [];
        setOrderSuccess({
          orders: placedOrders,
          total: activeSession.amount,
          method: 'Online Card Payment',
          address: getSelectedAddressObj(),
        });
      }
    } catch (err: any) {
      console.error('Payment verification failed', err);
      setErrorMsg(
        err.response?.data?.message ||
          'Payment confirmation failed. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-10 font-poppins">
      <div className="w-[92%] sm:w-[88%] max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Shopping Cart
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1.5">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span>•</span>
            <span className="text-gray-800 font-medium">Cart & Checkout</span>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 sm:p-16 text-center shadow-xs">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <ShoppingBag size={36} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Your Cart is Empty
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-md mx-auto">
              Looks like you haven't added any products to your cart yet. Browse
              our catalog to find verified deals.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <span>Explore Products</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items Column */}
            <div className="lg:col-span-8 space-y-6">
              {!user && (
                <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <Lock size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-900">
                        Sign in for seamless checkout
                      </p>
                      <p className="text-xs text-amber-700">
                        Login to access your saved addresses and track orders in
                        real-time.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/login?redirect=/cart"
                    className="inline-flex items-center justify-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
                  >
                    <span>Login to Continue</span>
                  </Link>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                <div className="hidden md:grid grid-cols-12 bg-gray-50 py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-gray-600 border-b border-gray-100">
                  <div className="col-span-6">Product Details</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                <div className="divide-y divide-gray-100">
                  {cart.map((item: any) => {
                    const qty = Number(item.quantity) || 1;
                    const price = Number(item.price || 0);

                    return (
                      <div
                        key={item.id}
                        className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="col-span-6 flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-50 rounded-xl p-2 flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden">
                            <img
                              src={item.image || '/placeholder-product.png'}
                              alt={item.title}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div>
                            <Link
                              href={`/product/${item.slug || item.id}`}
                              className="font-semibold text-xs sm:text-sm text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                            >
                              {item.title}
                            </Link>
                            <span className="text-xs text-gray-400 mt-0.5 block">
                              Unit: ${price.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-2 md:text-center flex md:block items-center justify-between">
                          <span className="text-xs text-gray-400 md:hidden">
                            Subtotal:
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-gray-900">
                            ${(price * qty).toFixed(2)}
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
                              <Minus size={13} />
                            </button>
                            <span className="px-3 text-xs font-bold text-gray-800">
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
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>

                        <div className="col-span-2 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemove(item.id)}
                            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
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
            </div>

            {/* Order Summary & Checkout Box */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-5">
              <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
                Order Summary
              </h2>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 font-semibold">
                    <span className="inline-flex items-center gap-1">
                      <Tag size={12} />
                      <span>Coupon Discount</span>
                    </span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-gray-600">
                  <span>Estimated Delivery</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-sm font-bold text-gray-900">
                  <span>Total Payable</span>
                  <span className="text-base font-extrabold text-blue-600">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Coupon Form */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Have a Promo Code?
                </label>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="e.g. DISCOUNT10"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-blue-600 transition-all uppercase"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    Apply
                  </button>
                </form>
                {couponMessage && (
                  <p
                    className={`text-xs mt-1.5 ${
                      couponMessage.type === 'success'
                        ? 'text-emerald-600'
                        : 'text-rose-500'
                    }`}
                  >
                    {couponMessage.text}
                  </p>
                )}
              </div>

              {/* Shipping Address Selection */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <MapPin size={13} className="text-blue-600" />
                    <span>Shipping Address</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(true)}
                    className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
                  >
                    + Add New
                  </button>
                </div>

                {loadingAddresses ? (
                  <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                ) : addresses.length > 0 ? (
                  <select
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 bg-white outline-none focus:border-blue-600 transition-all cursor-pointer truncate"
                  >
                    {addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.type} — {addr.street}, {addr.city} ({addr.country}
                        )
                      </option>
                    ))}
                  </select>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(true)}
                    className="w-full p-2.5 border border-dashed border-gray-300 rounded-lg text-xs text-gray-600 hover:border-blue-600 hover:text-blue-600 transition-all text-center cursor-pointer"
                  >
                    + Add a delivery address to proceed
                  </button>
                )}
              </div>

              {/* Payment Method Selection */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'COD'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-1 ring-blue-600'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <Truck size={16} className="mb-1 text-blue-600" />
                    <span className="text-xs font-bold block">
                      Cash on Delivery
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Pay upon receipt
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ONLINE')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'ONLINE'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-1 ring-blue-600'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <CreditCard size={16} className="mb-1 text-blue-600" />
                    <span className="text-xs font-bold block">Card Online</span>
                    <span className="text-[10px] text-gray-500">
                      Stripe Protected
                    </span>
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-600 flex items-start gap-2">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading || cart.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <span>
                  {loading
                    ? 'Processing Order...'
                    : paymentMethod === 'COD'
                    ? `Place Order · $${total.toFixed(2)}`
                    : `Proceed to Pay · $${total.toFixed(2)}`}
                </span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      <AddAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSuccess={() => {
          fetchAddresses();
          setIsAddressModalOpen(false);
        }}
      />

      {/* Card Payment Simulation Modal (Stripe) */}
      {isCardModalOpen && activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-poppins">
          <div
            className="fixed inset-0"
            onClick={() => !loading && setIsCardModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <CreditCard className="text-blue-600" size={18} />
                <h3 className="text-sm font-bold text-gray-900">
                  Stripe Secure Card Payment
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCardModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
              <span className="text-gray-600">Total Charged:</span>
              <span className="font-extrabold text-blue-700 text-sm">
                ${activeSession.amount.toFixed(2)}
              </span>
            </div>

            <div className="space-y-3" data-lpignore="true">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  data-lpignore="true"
                  data-form-type="other"
                  name="stripe_mock_name"
                  value={cardData.cardHolder}
                  onChange={(e) =>
                    setCardData({ ...cardData, cardHolder: e.target.value })
                  }
                  placeholder="Full Name"
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-gray-600">
                    Card Number
                  </label>
                  <span className="text-[10px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    Stripe Test Visa
                  </span>
                </div>
                <input
                  type="text"
                  autoComplete="off"
                  data-lpignore="true"
                  data-form-type="other"
                  name="stripe_mock_card"
                  value={cardData.cardNumber}
                  onChange={(e) =>
                    setCardData({ ...cardData, cardNumber: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs font-mono text-gray-800 outline-none focus:border-blue-600 bg-gray-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Expires (MM/YY)
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                    name="stripe_mock_exp"
                    value={cardData.expDate}
                    onChange={(e) =>
                      setCardData({ ...cardData, expDate: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs font-mono text-gray-800 outline-none focus:border-blue-600 bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    CVC
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
                    name="stripe_mock_cvc"
                    maxLength={4}
                    value={cardData.cvc}
                    onChange={(e) =>
                      setCardData({ ...cardData, cvc: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs font-mono text-gray-800 outline-none focus:border-blue-600 bg-gray-50/50"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmCardPayment}
              disabled={loading}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 text-xs"
            >
              <Lock size={14} />
              <span>
                {loading
                  ? 'Confirming with Stripe...'
                  : `Authorize Payment · $${activeSession.amount.toFixed(2)}`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Order Success Confirmation Celebration Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-poppins">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 border border-emerald-100">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-gray-900">
                Order Placed Successfully!
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Thank you for your purchase. We have received your order and
                notified the merchant.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 text-xs space-y-2 border border-gray-100 text-left">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Payment Method:</span>
                <span className="font-semibold text-gray-800">
                  {orderSuccess.method}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Total Amount:</span>
                <span className="font-bold text-gray-900">
                  ${orderSuccess.total.toFixed(2)}
                </span>
              </div>
              {orderSuccess.address && (
                <div className="pt-2 border-t border-gray-200/60 text-gray-600">
                  <span className="text-gray-400 block mb-0.5">
                    Shipping to:
                  </span>
                  <span className="font-medium text-gray-800">
                    {orderSuccess.address.street}, {orderSuccess.address.city},{' '}
                    {orderSuccess.address.country}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/profile?tab=orders"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <span>Track in Orders</span>
                <ExternalLink size={13} />
              </Link>
              <Link
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
