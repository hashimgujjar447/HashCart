'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Star, ArrowUpRight, Store } from 'lucide-react';

export interface ShopAvatar {
  id?: string;
  file_id?: string;
  url: string;
}

export interface ShopType {
  id: string;
  name: string;
  bio?: string | null;
  category: string;
  avatar?: ShopAvatar | null;
  coverBanner?: string | null;
  address: string;
  website?: string | null;
  opening_hours?: string | null;
  ratings?: number;
  followersCount?: number;
  createdAt?: string | Date;
}

interface ShopCardProps {
  shop: ShopType;
}

const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  const avatarUrl = shop?.avatar?.url;
  const coverUrl = shop?.coverBanner;

  return (
    <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Cover Banner */}
        <div className="w-full h-[120px] relative overflow-hidden bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={`${shop.name} cover`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-90 group-hover:scale-105 transition-transform duration-500">
              <Store className="text-white/40" size={42} />
            </div>
          )}
        </div>

        {/* Circular Avatar */}
        <div className="relative -mt-9 flex justify-center px-4">
          <div className="w-[72px] h-[72px] rounded-full border-4 border-white shadow-md overflow-hidden bg-white flex items-center justify-center shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={shop.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xl uppercase">
                {shop.name?.charAt(0) || 'S'}
              </div>
            )}
          </div>
        </div>

        {/* Shop Details */}
        <div className="px-5 pt-3 pb-2 text-center">
          <Link href={`/shop/${shop.id}`}>
            <h3
              className="font-bold text-gray-900 text-base hover:text-blue-600 transition-colors line-clamp-1"
              title={shop.name}
            >
              {shop.name}
            </h3>
          </Link>

          <p className="text-xs text-gray-500 font-medium mt-0.5">
            {shop.followersCount ?? 0} Followers
          </p>

          {/* Location & Rating */}
          <div className="flex items-center justify-center gap-3 mt-3 text-xs text-gray-600 flex-wrap">
            <div
              className="flex items-center gap-1 max-w-[140px] truncate"
              title={shop.address}
            >
              <MapPin size={13} className="text-gray-400 shrink-0" />
              <span className="truncate">{shop.address || 'No address'}</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Star size={13} className="text-amber-400 fill-amber-400" />
              <span className="font-semibold text-gray-700">
                {shop.ratings && shop.ratings > 0
                  ? shop.ratings.toFixed(1)
                  : 'N/A'}
              </span>
            </div>
          </div>

          {/* Category */}
          <div className="mt-2.5">
            <span className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              {shop.category || 'General'}
            </span>
          </div>
        </div>
      </div>

      {/* Action: Visit Shop */}
      <div className="px-5 pb-4 pt-3 border-t border-gray-100 mt-2 text-center">
        <Link
          href={`/shop/${shop.id}`}
          className="inline-flex items-center justify-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold text-xs tracking-wide group-hover:translate-x-0.5 transition-all"
        >
          <span>Visit Shop</span>
          <ArrowUpRight size={14} className="shrink-0" />
        </Link>
      </div>
    </div>
  );
};

export default ShopCard;
