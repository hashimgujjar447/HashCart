'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  MapPin,
  Star,
  Globe,
  Clock,
  Store,
  ChevronRight,
  ShoppingBag,
  Users,
} from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';
import ProductCard from '@/shared/cards/product-card';

const ShopDetailsPage = () => {
  const params = useParams();
  const shopId = params?.id as string;

  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        setShop(res.data.shop);
      } catch (err: any) {
        console.error('Failed to load shop details', err);
        setError('Shop not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };

    fetchShopDetails();
  }, [shopId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] py-12 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-[70vh] bg-[#f8f9fa] py-16 flex flex-col items-center justify-center font-poppins px-4">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-4">
          <Store size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Shop Not Found</h2>
        <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
          {error || "The shop you are looking for doesn't exist or is unavailable."}
        </p>
        <Link
          href="/shops"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors"
        >
          Browse All Shops
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
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden mb-10">
          {/* Banner */}
          <div className="w-full h-44 sm:h-56 relative bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={`${shop.name} cover`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90">
                <Store size={64} className="text-white/30" />
              </div>
            )}
          </div>

          {/* Shop Info Row */}
          <div className="px-6 pb-6 pt-0">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
              <div className="flex items-end gap-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={shop.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl uppercase">
                      {shop.name?.charAt(0) || 'S'}
                    </div>
                  )}
                </div>

                <div className="mb-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">
                    {shop.name}
                  </h1>
                  <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1">
                    {shop.category || 'General'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700">
                  <Users size={14} className="text-gray-500" />
                  <span>{shop.followersCount ?? 0} Followers</span>
                </div>

                <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-semibold text-amber-800">
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  <span>
                    {shop.ratings && shop.ratings > 0
                      ? shop.ratings.toFixed(1)
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {shop.bio && (
              <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-3xl leading-relaxed">
                {shop.bio}
              </p>
            )}

            {/* Meta Row */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-600 flex-wrap">
              {shop.address && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-gray-400 shrink-0" />
                  <span>{shop.address}</span>
                </div>
              )}
              {shop.opening_hours && (
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-gray-400 shrink-0" />
                  <span>{shop.opening_hours}</span>
                </div>
              )}
              {shop.website && (
                <a
                  href={shop.website.startsWith('http') ? shop.website : `https://${shop.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-blue-600 hover:underline"
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
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center shadow-xs">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                <ShoppingBag size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                No Products Available
              </h3>
              <p className="text-xs text-gray-500 max-w-sm">
                This shop hasn't published any active products yet. Check back later!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopDetailsPage;
