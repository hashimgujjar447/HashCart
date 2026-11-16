'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  MapPin,
  Star,
  Globe,
  Clock,
  Store,
  ChevronRight,
  ShoppingBag,
  Users,
  UserPlus,
  Check,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';
import ProductCard from '@/shared/cards/product-card';
import useUser from '@/hooks/useUser';

const ShopDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const shopId = params?.id as string;
  const { user } = useUser();

  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Follow state
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followLoading, setFollowLoading] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    if (!shopId) return;

    const fetchShopDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        let res;
        try {
          res = await axiosInstance.get(`/shop/get-shop/${shopId}`);
        } catch (e1) {
          try {
            res = await axiosInstance.get(`/auth/get-shop/${shopId}`);
          } catch (e2) {
            res = await axiosInstance.get(`/product/get-shop/${shopId}`);
          }
        }
        const data = res.data.shop;
        setShop(data);
        setFollowersCount(data?.followersCount ?? 0);
      } catch (err: any) {
        console.error('Failed to load shop details', err);
        setError('Shop not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };

    fetchShopDetails();
  }, [shopId]);

  // Check if current user is following this shop
  useEffect(() => {
    if (user?.following && shopId) {
      setIsFollowing(user.following.includes(shopId));
    }
  }, [user, shopId]);

  // Handle Follow / Unfollow
  const handleToggleFollow = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      setFollowLoading(true);
      const res = await axiosInstance.put('/auth/toggle-follow-shop', {
        shopId,
      });
      setIsFollowing(res.data?.isFollowing);
      if (typeof res.data?.followersCount === 'number') {
        setFollowersCount(res.data.followersCount);
      }
    } catch (err: any) {
      console.error('Follow toggle error:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] py-16 flex justify-center items-center font-poppins">
        <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-[70vh] bg-[#f8f9fa] py-16 flex flex-col items-center justify-center font-poppins px-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 border border-rose-200 flex items-center justify-center mb-4">
          <Store size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Shop Not Found</h2>
        <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
          {error ||
            "The shop you are looking for doesn't exist or is currently unavailable."}
        </p>
        <Link
          href="/shops"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition shadow-sm"
        >
          Browse All Stores
        </Link>
      </div>
    );
  }

  const avatarUrl = shop?.avatar?.url;
  const coverUrl = shop?.coverBanner;
  const products = shop?.products || [];

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-8 font-poppins">
      <div className="w-[90%] max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <ChevronRight size={14} />
          <Link href="/shops" className="hover:text-blue-600 transition-colors">
            Shops
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-semibold">{shop.name}</span>
        </nav>

        {/* Shop Hero Card */}
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm overflow-hidden mb-10">
          {/* Banner Container */}
          <div className="w-full h-48 sm:h-64 md:h-72 relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={`${shop.name} banner`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700">
                <Store size={56} className="text-white/20" />
              </div>
            )}
            {/* Bottom Vignette for seamless contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

            {/* Share button in top right of banner */}
            <button
              onClick={handleShare}
              className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 transition cursor-pointer"
            >
              <Share2 size={13} />
              <span>{copiedLink ? 'Link Copied!' : 'Share Store'}</span>
            </button>
          </div>

          {/* Shop Header Details Row */}
          <div className="relative z-10 px-6 sm:px-8 pb-6 pt-0">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 pb-5 border-b border-gray-100">
              {/* Left: Avatar & Title */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-5">
                {/* Avatar with clear z-index and border */}
                <div className="relative -mt-16 sm:-mt-20 shrink-0 w-28 h-28 sm:w-36 sm:h-36 rounded-2xl sm:rounded-3xl border-4 border-white shadow-xl bg-white overflow-hidden z-30 ring-1 ring-black/5">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={shop.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center text-white font-black text-3xl sm:text-4xl uppercase">
                      {shop.name?.charAt(0) || 'S'}
                    </div>
                  )}
                </div>

                {/* Title & Category Info */}
                <div className="pt-1 sm:pt-0 sm:pb-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                      {shop.name}
                    </h1>
                    <CheckCircle2
                      size={20}
                      className="text-blue-600 shrink-0 fill-blue-50"
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {shop.category || 'General Store'}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 font-medium">
                      {products.length} Products Available
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Actions & Metrics (Follow Button, Rating, Followers) */}
              <div className="flex items-center gap-3 self-start sm:self-end pt-2 sm:pt-0 flex-wrap">
                {/* Follow / Unfollow Button */}
                <button
                  type="button"
                  onClick={handleToggleFollow}
                  disabled={followLoading}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 ${
                    isFollowing
                      ? 'bg-gray-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-gray-300 text-gray-800'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                  }`}
                >
                  {followLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <Check size={14} className="text-emerald-600" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} />
                      <span>Follow Store</span>
                    </>
                  )}
                </button>

                {/* Followers count badge */}
                <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700">
                  <Users size={14} className="text-gray-500" />
                  <span>{followersCount} Followers</span>
                </div>

                {/* Rating badge */}
                <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800">
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  <span>
                    {shop.ratings && shop.ratings > 0
                      ? shop.ratings.toFixed(1)
                      : '5.0'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {shop.bio && (
              <p className="text-xs sm:text-sm text-gray-600 mt-4 max-w-3xl leading-relaxed">
                {shop.bio}
              </p>
            )}

            {/* Meta Row: Location, Hours, Website */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-600 flex-wrap">
              {shop.address && (
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin size={14} className="text-gray-400 shrink-0" />
                  <span>{shop.address}</span>
                </div>
              )}
              {shop.opening_hours && (
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock size={14} className="text-gray-400 shrink-0" />
                  <span>{shop.opening_hours}</span>
                </div>
              )}
              {shop.website && (
                <a
                  href={
                    shop.website.startsWith('http')
                      ? shop.website
                      : `https://${shop.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-blue-600 hover:underline font-medium"
                >
                  <Globe size={14} className="shrink-0" />
                  <span>{shop.website}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Shop Products Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              Products from {shop.name} ({products.length})
            </h2>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                <ShoppingBag size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                No Products Available
              </h3>
              <p className="text-xs text-gray-500 max-w-sm">
                This store has not published any active products yet. Check back
                soon!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopDetailsPage;
