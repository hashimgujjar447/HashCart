'use client';

import React, { useState, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Search,
  Percent,
  Download,
  CreditCard,
  Building2,
  HelpCircle,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { useSeller } from '@/app/hooks/useSeller';
import axiosInstance from '@/app/utils/axiosInstance';

interface Transaction {
  id: string;
  orderId: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  grossAmount: number;
  commissionFee: number;
  netPayout: number;
  payoutStatus: 'Available' | 'In Escrow' | 'Cancelled';
}

interface PaymentStats {
  grossRevenue: number;
  netLifetimeEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  totalCommissionPaid: number;
  commissionRate: number;
  deliveredOrdersCount: number;
  totalOrdersCount: number;
}

interface PaymentsResponse {
  success: boolean;
  stats: PaymentStats;
  stripe: {
    isConnected: boolean;
    stripeId: string | null;
  };
  transactions: Transaction[];
}

const fetchSellerPayments = async (): Promise<PaymentsResponse> => {
  const res = await axiosInstance.get('/order/get-seller-payments');
  return res.data;
};

function PaymentsContent() {
  const { seller } = useSeller();
  const searchParams = useSearchParams();
  const stripeConnectedParam = searchParams.get('stripe_connect');

  const [filter, setFilter] = useState<'ALL' | 'Available' | 'In Escrow' | 'Cancelled'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  const {
    data,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['seller-payments'],
    queryFn: fetchSellerPayments,
    refetchInterval: 30000,
  });

  const stats = data?.stats || {
    grossRevenue: 0,
    netLifetimeEarnings: 0,
    availableBalance: 0,
    pendingBalance: 0,
    totalCommissionPaid: 0,
    commissionRate: 10,
    deliveredOrdersCount: 0,
    totalOrdersCount: 0,
  };

  const isStripeConnected = Boolean(data?.stripe?.isConnected || seller?.stripeId);
  const stripeId = data?.stripe?.stripeId || seller?.stripeId;

  // Handle Stripe Express Onboarding
  const handleConnectStripe = async () => {
    if (!seller?.id) {
      setStripeError('Seller profile not loaded. Please refresh.');
      return;
    }

    try {
      setIsConnectingStripe(true);
      setStripeError(null);
      const res = await axiosInstance.post(
        '/auth/create-stripe-connect-account-link',
        { sellerId: seller.id },
      );

      const url = res.data?.accountLink?.url;
      if (url) {
        window.location.href = url;
      } else {
        setStripeError('Could not generate Stripe onboarding link. Please try again.');
      }
    } catch (err: any) {
      console.error('Stripe connect error:', err);
      setStripeError(
        err?.response?.data?.message ||
          'Failed to connect to Stripe Express. Please try again later.',
      );
    } finally {
      setIsConnectingStripe(false);
    }
  };

  const transactions = data?.transactions || [];

  const filteredTransactions = transactions.filter((tx) => {
    const matchesFilter = filter === 'ALL' ? true : tx.payoutStatus === filter;
    const matchesSearch =
      tx.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="w-full max-w-[1400px] mx-auto py-8 px-4 sm:px-6 text-white space-y-6">
        <div className="h-9 w-64 bg-slate-800/60 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-slate-800/30 rounded-2xl animate-pulse"
            />
          ))}
        </div>
        <div className="h-64 bg-slate-800/30 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Payments & Payouts
            </h1>
            <p className="text-sm text-slate-400">
              Manage your revenue, earnings distribution, and automated Stripe
              payouts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 text-slate-300 transition"
            title="Refresh payments data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export Statement</span>
          </button>
        </div>
      </div>

      {/* Stripe Connect Success Notification Banner */}
      {stripeConnectedParam === 'success' && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span className="text-sm font-medium">
            Stripe Express account verified! Payouts will now be automatically
            deposited to your bank account.
          </span>
        </div>
      )}

      {/* Stripe Error Banner */}
      {stripeError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span className="text-sm font-medium">{stripeError}</span>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Available Balance */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-emerald-500/20 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Available for Payout
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ${stats.availableBalance.toFixed(2)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Delivered & eligible for payout</span>
          </div>
        </div>

        {/* Pending Escrow Balance */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pending in Escrow
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ${stats.pendingBalance.toFixed(2)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-400 font-medium">
            <Truck className="w-3.5 h-3.5" />
            <span>In processing / transit</span>
          </div>
        </div>

        {/* Net Lifetime Earnings */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Net Lifetime Earnings
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ${stats.netLifetimeEarnings.toFixed(2)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-400 font-medium">
            <Percent className="w-3.5 h-3.5" />
            <span>90% seller revenue share</span>
          </div>
        </div>

        {/* Platform Commission Paid */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Marketplace Fee (10%)
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ${stats.totalCommissionPaid.toFixed(2)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span>Gross: ${stats.grossRevenue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Stripe Connect Hub & Fee Split Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stripe Express Status (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0c121e] border border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-semibold text-white">
                  Stripe Express Payout Gateway
                </h2>
              </div>

              {isStripeConnected ? (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Connected & Active</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Setup Required</span>
                </span>
              )}
            </div>

            {isStripeConnected ? (
              <div className="space-y-3 text-sm text-slate-300">
                <p className="leading-relaxed">
                  Your store is linked to Stripe Express. Available balances are
                  routed automatically to your verified bank account according to
                  your Stripe payout schedule.
                </p>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span>Connected Stripe Account ID:</span>
                    <span className="font-mono text-slate-200">{stripeId}</span>
                  </div>
                  <span className="text-emerald-400 font-medium">Ready</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-slate-300">
                <p className="leading-relaxed">
                  To receive automated daily or weekly deposits from customer
                  orders, connect your bank account via Stripe Express. Setup
                  takes less than 2 minutes.
                </p>
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Earnings will remain in your marketplace balance until your
                    Stripe account is verified.
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center gap-3">
            {isStripeConnected ? (
              <button
                type="button"
                onClick={handleConnectStripe}
                disabled={isConnectingStripe}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold transition"
              >
                <span>Update Bank Account on Stripe</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConnectStripe}
                disabled={isConnectingStripe}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
              >
                {isConnectingStripe ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Connecting to Stripe...</span>
                  </>
                ) : (
                  <>
                    <span>Connect with Stripe Express</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* 90/10 Revenue Split Box */}
        <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4">
              <Percent className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">
                Revenue Share Split
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Seller Take-Home
                </span>
                <span className="font-bold text-white">90%</span>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: '90%' }}
                />
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: '10%' }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  Platform Commission
                </span>
                <span className="font-bold text-white">10%</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 font-medium text-slate-300">
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>How Escrow Works</span>
            </div>
            <p className="leading-relaxed">
              When an order is created, customer payment is escrowed safely. Upon
              delivery confirmation, your 90% net share unlocks to Available
              Balance instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Transactions & Payouts Table */}
      <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-white">
              Order Payout Transactions
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Individual gross earnings, platform commission breakdown, and
              payout release status
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by Order ID, Buyer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 transition"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {(['ALL', 'Available', 'In Escrow', 'Cancelled'] as const).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-lg font-medium transition ${
                  filter === tab
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {tab === 'ALL'
                  ? `All Transactions (${transactions.length})`
                  : `${tab} (${
                      transactions.filter((t) => t.payoutStatus === tab).length
                    })`}
              </button>
            ),
          )}
        </div>

        {/* Table Content */}
        {filteredTransactions.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-500">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">
              No transactions found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm">
              {searchTerm
                ? 'No payout records match your search criteria.'
                : 'As customers purchase your products, individual revenue splits and payout records will populate here automatically.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800/80 bg-slate-900/40">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Gross Sale</th>
                  <th className="py-3 px-4">Platform Fee (10%)</th>
                  <th className="py-3 px-4">Net Payout (90%)</th>
                  <th className="py-3 px-4">Payout Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-900/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-white">
                      #{tx.orderId.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">
                        {tx.customerName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {tx.customerEmail}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(tx.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      ${tx.grossAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      -${tx.commissionFee.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">
                      ${tx.netPayout.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      {tx.payoutStatus === 'Available' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Available</span>
                        </span>
                      ) : tx.payoutStatus === 'In Escrow' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>In Escrow</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400 inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Cancelled</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[1400px] mx-auto py-8 px-4 sm:px-6 text-white space-y-6">
          <div className="h-9 w-64 bg-slate-800/60 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-slate-800/30 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      }
    >
      <PaymentsContent />
    </Suspense>
  );
}
