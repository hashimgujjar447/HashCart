'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Clock,
  Truck,
  CheckCircle2,
  User,
  ShoppingBag,
  MessageSquare,
  Bell,
  MapPin,
  Lock,
  LogOut,
  ChevronRight,
  AlertCircle,
  MapPinCheck,
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import axiosInstance from '@/utils/axiosInstance';
import ProfileTab from '@/shared/modules/profile/profile-tab';
import ShippingAddressTab from '@/shared/modules/profile/shipping-address-tab';
import OrdersTab from '@/shared/modules/profile/orders-tab';
import InboxTab from '@/shared/modules/profile/inbox-tab';
import NotificationsTab from '@/shared/modules/profile/notifications-tab';
import ChangePasswordTab from '@/shared/modules/profile/change-password-tab';

type TabType =
  | 'profile'
  | 'orders'
  | 'inbox'
  | 'notifications'
  | 'address'
  | 'password';

// ─── Skeleton Screen ────────────────────────────────────────────────────────
const ProfileSkeleton = () => (
  <div className="bg-[#f8f9fa] min-h-screen py-10 font-poppins animate-pulse">
    <div className="w-[90%] max-w-6xl mx-auto">
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-40 bg-gray-200 rounded mb-6" />
      {/* Header skeleton */}
      <div className="h-9 w-72 bg-gray-200 rounded mx-auto mb-8" />
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200/80 p-5 h-24" />
        ))}
      </div>
      {/* Layout skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-xl border border-gray-200/80 p-3 h-80" />
        <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-xl border border-gray-200/80 p-8 h-96" />
      </div>
    </div>
  </div>
);

// ─── Profile Content Component ───────────────────────────────────────────────
const ProfileContent = () => {
  const { user: liveUser, cachedUser, isLoading, refetch: refetchUser } = useUser();
  const searchParams = useSearchParams();

  // Prioritize live user, fall back to cached Zustand user for immediate rendering
  const user = liveUser || cachedUser;

  const tabParam = searchParams.get('tab') as TabType | null;
  const noticeParam = searchParams.get('notice');
  const redirectParam = searchParams.get('redirect');

  const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'profile');
  const [stats, setStats] = useState({
    totalOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
  });

  useEffect(() => {
    if (tabParam && ['profile', 'orders', 'inbox', 'notifications', 'address', 'password'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        let res;
        try {
          res = await axiosInstance.get('/order/get-user-orders');
        } catch {
          res = await axiosInstance.get('/auth/get-user-orders');
        }
        if (res.data?.stats) {
          setStats(res.data.stats);
        }
      } catch (err) {
        // Fallback default stats preserved
      }
    };
    if (user) {
      loadStats();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await axiosInstance.get('/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      window.location.href = '/login';
    }
  };

  const navItems: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'inbox', label: 'Inbox', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'address', label: 'Shipping Address', icon: MapPin },
    { id: 'password', label: 'Change Password', icon: Lock },
  ];

  // Only show skeleton if we have neither live nor cached user while loading
  if (isLoading && !user) return <ProfileSkeleton />;

  const displayName = user?.name || 'My Account';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Profile completion check
  const isProfileIncomplete = !user?.avatar?.url || !user?.phone_number;

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-10 font-poppins">
      <div className="w-[90%] max-w-6xl mx-auto">

        {/* ── Breadcrumb ──────────────────────────────────────────────── */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight size={13} className="text-gray-300" />
          <span className="text-gray-600 font-medium">My Account</span>
          {activeTab !== 'profile' && (
            <>
              <ChevronRight size={13} className="text-gray-300" />
              <span className="text-blue-600 font-semibold capitalize">{activeTab}</span>
            </>
          )}
        </nav>

        {/* ── Notice: Address prompt from checkout/login ─────────────────── */}
        {noticeParam === 'add_address' && (
          <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-4 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <MapPinCheck size={20} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-blue-950">
                  Shipping Address Required
                </h4>
                <p className="text-xs text-blue-800/80 mt-0.5">
                  Please add your delivery address below so we can complete your orders smoothly.
                </p>
              </div>
            </div>
            {redirectParam && (
              <span className="text-[11px] font-medium bg-blue-200/60 text-blue-800 px-3 py-1 rounded-md hidden sm:inline-block">
                Returns to checkout after saving
              </span>
            )}
          </div>
        )}

        {/* ── Welcome Header ───────────────────────────────────────────── */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center justify-center gap-2">
            <span>Welcome back,</span>
            <span className="text-blue-600">{displayName}</span>
            <span className="text-2xl">👋</span>
          </h1>
        </div>

        {/* ── Profile Completion Banner ────────────────────────────────── */}
        {isProfileIncomplete && noticeParam !== 'add_address' && (
          <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5">
            <AlertCircle size={18} className="text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700 font-medium flex-1">
              Complete your profile to get the best experience — add a photo and phone number.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              Complete Now
            </button>
          </div>
        )}

        {/* ── Stat Cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Total Orders — Blue */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs flex items-center justify-between border-l-4 border-l-blue-500">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Total Orders</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {stats.totalOrders}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full border border-blue-100 bg-blue-50/60 flex items-center justify-center text-blue-600 shrink-0">
              <Clock size={24} className="stroke-[2.2]" />
            </div>
          </div>

          {/* Processing — Amber */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs flex items-center justify-between border-l-4 border-l-amber-500">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Processing Orders</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {stats.processingOrders}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full border border-amber-100 bg-amber-50/60 flex items-center justify-center text-amber-600 shrink-0">
              <Truck size={24} className="stroke-[2.2]" />
            </div>
          </div>

          {/* Completed — Green */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs flex items-center justify-between border-l-4 border-l-green-500">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Completed Orders</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {stats.completedOrders}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full border border-green-100 bg-green-50/60 flex items-center justify-center text-green-600 shrink-0">
              <CheckCircle2 size={24} className="stroke-[2.2]" />
            </div>
          </div>
        </div>

        {/* ── Mobile Horizontal Tab Bar ────────────────────────────────── */}
        <div className="lg:hidden mb-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 w-max px-0.5 pb-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Two-Column Layout ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 bg-white rounded-xl border border-gray-200/80 p-3 shadow-xs sticky top-24">

            {/* User Identity Block */}
            <div className="flex flex-col items-center text-center px-3 py-4 mb-2 border-b border-gray-100">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center border-4 border-white shadow-md overflow-hidden mb-3">
                {user?.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{initials || 'U'}</span>
                )}
              </div>
              <h3 className="font-bold text-gray-900 text-sm leading-tight">{displayName}</h3>
              {user?.email && (
                <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-full px-2">{user.email}</p>
              )}
            </div>

            {/* Nav Items */}
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600 pl-2.5'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon
                      size={17}
                      className={isActive ? 'text-blue-600' : 'text-gray-500'}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <div className="pt-2 mt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut size={17} className="text-red-600" />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* Right Main Content */}
          <main className="lg:col-span-8 xl:col-span-9 bg-white rounded-xl border border-gray-200/80 p-6 sm:p-8 shadow-xs min-h-[460px]">
            {activeTab === 'profile' && (
              <ProfileTab user={user} refetchUser={refetchUser} />
            )}
            {activeTab === 'orders' && (
              <OrdersTab onStatsLoaded={(newStats) => setStats(newStats)} />
            )}
            {activeTab === 'inbox' && <InboxTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
            {activeTab === 'address' && (
              <ShippingAddressTab
                redirectUrl={redirectParam}
                autoOpenAdd={noticeParam === 'add_address'}
              />
            )}
            {activeTab === 'password' && <ChangePasswordTab />}
          </main>
        </div>
      </div>
    </div>
  );
};

// ─── Exported Page (wrapped in Suspense for Next.js 14/15/16) ──────────────────
const ProfilePage = () => {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
};

export default ProfilePage;
