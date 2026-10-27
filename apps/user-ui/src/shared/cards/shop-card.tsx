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
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Cover Banner */}
        <div className="w-full h-[110px] relative overflow-hidden bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={`${shop.name} cover`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 opacity-90 group-hover:scale-105 transition-transform duration-500">
              <Store className="text-white/30" size={38} />
            </div>
          )}
        </div>

        {/* Circular Avatar */}
        <div className="relative -mt-9 flex justify-center px-4">
          <div className="w-16 h-16 rounded-full border-4 border-white shadow-sm overflow-hidden bg-white flex items-center justify-center shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={shop.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold text-lg uppercase">
                {shop.name?.charAt(0) || 'S'}
              </div>
            )}
          </div>
        </div>

        {/* Shop Details */}
        <div className="px-5 pt-2.5 pb-2 text-center">
          <Link href={`/shop/${shop.id}`}>
            <h3
              className="font-bold text-slate-900 text-sm sm:text-base hover:text-blue-600 transition-colors line-clamp-1"
              title={shop.name}
            >
              {shop.name}
            </h3>
          </Link>

          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            {shop.followersCount ?? 0} Followers
          </p>

          {/* Location & Rating */}
          <div className="flex items-center justify-center gap-2.5 mt-2.5 text-xs text-slate-500 flex-wrap">
            <div
              className="flex items-center gap-1 max-w-[130px] truncate"
              title={shop.address}
            >
              <MapPin size={12} className="text-slate-400 shrink-0" />
              <span className="truncate text-[11px]">{shop.address || 'Verified Store'}</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span className="font-semibold text-slate-700 text-[11px]">
                {shop.ratings && shop.ratings > 0
                  ? Number(shop.ratings).toFixed(1)
                  : '5.0'}
              </span>
            </div>
          </div>

          {/* Category */}
          <div className="mt-2">
            <span className="inline-block text-[10px] font-semibold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-full border border-blue-100">
              {shop.category || 'General'}
            </span>
          </div>
        </div>
      </div>

      {/* Action: Visit Shop */}
      <div className="px-5 pb-3.5 pt-2.5 border-t border-slate-100 mt-2 text-center">
        <Link
          href={`/shop/${shop.id}`}
          className="inline-flex items-center justify-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-xs tracking-wide group-hover:translate-x-0.5 transition-all"
        >
          <span>Visit Shop</span>
          <ArrowUpRight size={13} className="shrink-0" />
        </Link>
      </div>
    </div>
  );
};

export default ShopCard;
